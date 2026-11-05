/* Produktkatalog bebtidz. – Preise in CHF */
window.BEBTIDZ = {
  code: 'WELCOME10',
  discount: 0.1,
  categories: ['Alle', 'Peptide', 'Blends', 'Zubehör'],
  products: [
    { slug: 'bpc-157', name: 'BPC-157', category: 'Peptide', price: 39, purity: '≥ 99 % (HPLC)', bestseller: true,
      description: 'Lyophilisiertes Pentadecapeptid für In-vitro-Forschung. Geliefert mit Analysezertifikat.',
      variants: [{ label: '5 mg', price: 39 }, { label: '10 mg', price: 69 }], img: 'assets/img/vial.jpg' },
    { slug: 'tb-500', name: 'TB-500', category: 'Peptide', price: 45, purity: '≥ 99 % (HPLC)', bestseller: true,
      description: 'Synthetisches Fragment von Thymosin Beta-4 für Laborstudien.',
      variants: [{ label: '5 mg', price: 45 }, { label: '10 mg', price: 79 }], img: 'assets/img/vial.jpg' },
    { slug: 'ghk-cu', name: 'GHK-Cu', category: 'Peptide', price: 29, purity: '≥ 98 % (HPLC)', bestseller: true,
      description: 'Kupfer-Tripeptid-Komplex für biochemische Forschungszwecke.',
      variants: [{ label: '50 mg', price: 29 }, { label: '100 mg', price: 49 }], img: 'assets/img/vial.jpg' },
    { slug: 'ipamorelin', name: 'Ipamorelin', category: 'Peptide', price: 35, purity: '≥ 99 % (HPLC)', bestseller: false,
      description: 'Pentapeptid für rezeptorbezogene Forschung im Labor.',
      variants: [{ label: '5 mg', price: 35 }, { label: '10 mg', price: 59 }], img: 'assets/img/vial.jpg' },
    { slug: 'bpc-tb-blend', name: 'BPC-157 / TB-500 Blend', category: 'Blends', price: 75, purity: '≥ 98 % (HPLC)', bestseller: true,
      description: 'Kombination beider Peptide in einem Vial für vergleichende Studien.',
      variants: [{ label: '10 mg', price: 75 }, { label: '20 mg', price: 135 }], img: 'assets/img/vial.jpg' },
    { slug: 'bac-water', name: 'Bakteriostatisches Wasser', category: 'Zubehör', price: 12, purity: '0,9 % Benzylalkohol', bestseller: false,
      description: 'Steriles Lösungsmittel für die Rekonstitution im Labor.',
      variants: [{ label: '10 ml', price: 12 }, { label: '30 ml', price: 24 }], img: 'assets/img/vial.jpg' }
  ]
};
