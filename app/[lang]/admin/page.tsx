import { redirect } from "next/navigation";

export default function AdminRootPage() {
  // Redirige automatiquement toute personne tapant "/admin" vers la version française (ou celle par défaut)
  redirect("/fr/admin/menu");
}