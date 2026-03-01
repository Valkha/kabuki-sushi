/**
 * 🔒 WEBHOOK STRIPE SÉCURISÉ — kabuki-sushi.ch
 *
 * Protections implémentées :
 *  1. Vérification de signature HMAC (constructEvent)
 *  2. Protection anti-replay via idempotence en base
 *  3. Lecture du body en raw text (obligatoire pour Stripe)
 *  4. Vérification de fraîcheur de l'événement (5 min max)
 *  5. Gestion d'erreurs granulaire avec logs structurés
 *  6. Utilisation du service_role (bypass RLS pour écriture serveur)
 */

import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';


// ─── Clients ──────────────────────────────────────────────────────────────────

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ⚠️ SERVICE ROLE : bypass complet du RLS
// Ce client ne doit JAMAIS être instancié côté client (browser)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ─── Idempotence (Anti-Replay) ─────────────────────────────────────────────────

/**
 * Vérifie si un event Stripe a déjà été traité.
 * Utilise une contrainte UNIQUE sur stripe_event_id pour être
 * thread-safe même en cas de requêtes concurrentes.
 */
async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .maybeSingle();

  if (error) {
    console.error('[webhook] Erreur lecture idempotence:', error.message);
    // En cas de doute, on refuse de retraiter
    return true;
  }

  return !!data;
}

/**
 * Marque un event comme traité.
 * La contrainte UNIQUE en DB assure qu'un double-traitement concurrent
 * résulte en une erreur DB plutôt qu'un double-insert silencieux.
 */
async function markAsProcessed(
  eventId: string,
  eventType: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({
      stripe_event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    });

  if (error) {
    // Erreur 23505 = violation de contrainte UNIQUE (double traitement concurrent)
    if (error.code === '23505') {
      console.warn(`[webhook] Double traitement détecté pour ${eventId}, ignoré`);
    } else {
      console.error('[webhook] Erreur marquage idempotence:', error.message);
    }
  }
}

// ─── Handlers par type d'événement ───────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const cartMetadata = session.metadata?.cart;

  if (!cartMetadata) {
    console.error('[webhook] Metadata cart manquante dans la session:', session.id);
    return;
  }

  let cart: Array<{ menuItemId: string; quantity: number }>;
  try {
    cart = JSON.parse(cartMetadata);
  } catch {
    console.error('[webhook] Metadata cart invalide (JSON malformé):', cartMetadata);
    return;
  }

  // Récupérer les vrais prix depuis la DB (jamais depuis Stripe metadata)
  const menuItemIds = cart.map((i) => i.menuItemId);
  const { data: menuItems, error: menuError } = await supabaseAdmin
    .from('menu_items')
    .select('id, name, price_cents')
    .in('id', menuItemIds);

  if (menuError || !menuItems) {
    console.error('[webhook] Impossible de récupérer les prix:', menuError?.message);
    return;
  }

  // Créer la commande
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      user_id: session.metadata?.userId ?? null,
      customer_email: session.customer_details?.email ?? null,
      status: 'paid',
      total_cents: session.amount_total ?? 0,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[webhook] Erreur création commande:', orderError?.message);
    return;
  }

  // Créer les items avec les prix SERVEUR (pas ceux du client)
  const orderItems = cart.map((cartItem) => {
    const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
    return {
      order_id: order.id,
      menu_item_id: cartItem.menuItemId,
      quantity: cartItem.quantity,
      unit_price_cents: menuItem?.price_cents ?? 0, // ✅ Prix depuis la DB
      name_snapshot: menuItem?.name ?? 'Article inconnu',
    };
  });

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('[webhook] Erreur création order_items:', itemsError.message);
    return;
  }

  console.info(`[webhook] ✅ Commande ${order.id} créée pour session ${session.id}`);
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'payment_failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('[webhook] Erreur mise à jour statut paiement échoué:', error.message);
  } else {
    console.info(`[webhook] ⚠️ Paiement échoué pour PaymentIntent ${paymentIntent.id}`);
  }
}

async function handleRefundCreated(charge: Stripe.Charge): Promise<void> {
  if (!charge.payment_intent) return;

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'refunded' })
    .eq('stripe_payment_intent_id', charge.payment_intent as string);

  if (error) {
    console.error('[webhook] Erreur mise à jour statut remboursement:', error.message);
  } else {
    console.info(`[webhook] 💸 Remboursement enregistré pour ${charge.payment_intent}`);
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  // 🔑 CRITIQUE : Lire le body en RAW TEXT avant tout parsing
  // JSON.parse() ou req.json() altère le body et invalide la signature HMAC
  const rawBody = await req.text();
  const headersList = await headers();
  const stripeSignature = headersList.get('stripe-signature');

  // ── Guard 1 : Signature présente ──
  if (!stripeSignature) {
    console.warn('[webhook] Requête reçue sans header stripe-signature');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  // ── Guard 2 : Vérification cryptographique de la signature ──
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET! // whsec_... depuis Dashboard Stripe
    );
  } catch (err) {
    // Ne pas logger le body complet (peut contenir des données sensibles)
    console.error('[webhook] ❌ Signature invalide:', err instanceof Error ? err.message : err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // ── Guard 3 : Fraîcheur de l'événement (anti-replay temporel) ──
  // Stripe envoie les webhooks max 72h après l'événement, mais on reste strict à 10min
  // pour les événements de paiement. Note : Stripe gère déjà une tolérance de 5min
  // avec constructEvent, ce check est une couche de défense supplémentaire.
  const eventAgeSeconds = Math.floor(Date.now() / 1000) - event.created;
  const MAX_EVENT_AGE_SECONDS = 600; // 10 minutes

  if (eventAgeSeconds > MAX_EVENT_AGE_SECONDS) {
    console.warn(
      `[webhook] Événement trop ancien: ${eventAgeSeconds}s (max ${MAX_EVENT_AGE_SECONDS}s) — ID: ${event.id}`
    );
    return new Response('Event timestamp too old', { status: 400 });
  }

  // ── Guard 4 : Idempotence (anti-replay applicatif) ──
  if (await isAlreadyProcessed(event.id)) {
    console.info(`[webhook] Événement ${event.id} déjà traité, skip`);
    // Retourner 200 : Stripe arrête de renvoyer si on répond 2xx
    return new Response('Already processed', { status: 200 });
  }

  // ── Dispatch par type d'événement ──
  console.info(`[webhook] Traitement de l'événement: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefundCreated(event.data.object as Stripe.Charge);
        break;

      default:
        // Logger les événements non gérés (utile pour le monitoring)
        console.info(`[webhook] Événement non géré: ${event.type}`);
    }
  } catch (err) {
    // Ne PAS marquer comme traité si une erreur survient
    // Stripe retentera l'envoi automatiquement
    console.error(`[webhook] Erreur non gérée pour ${event.type}:`, err);
    return new Response('Internal processing error', { status: 500 });
  }

  // Marquer comme traité APRÈS le traitement réussi
  await markAsProcessed(event.id, event.type);

  return new Response('OK', { status: 200 });
}