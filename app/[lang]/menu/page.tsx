import { Metadata } from "next";
import MenuClient from "./MenuClient";

type Props = {
  params: { lang: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = params.lang || "fr";
  
  // ✅ On remplace 'any' par un dictionnaire strict
  const titles: Record<string, string> = {
    fr: "Notre Carte | 97 Créations Originales",
    en: "Our Menu | 97 Original Sushi Creations",
    es: "Nuestra Carta | 97 Creaciones de Sushi",
  };

  const descriptions: Record<string, string> = {
    fr: "Découvrez nos 97 produits : Nigiris, Makis, Signatures et Box à partager.",
    en: "Explore our 97 products: Nigiris, Makis, Signatures, and Boxes to share.",
    es: "Descubre nuestros 97 productos: Nigiris, Makis, Signatures y Boxes para compartir.",
  };

  return {
    title: titles[lang] || titles.fr,
    description: descriptions[lang] || descriptions.fr,
  };
}

// ✅ On retire 'params' car il n'est pas utilisé dans le composant (règle ESLint)
export default function MenuPage() {
  return <MenuClient />;
}