export interface Car {
  id: string;          // 992300613
  url: string;         // https://www.willhaben.at/iad/...
  title: string;       // "Opel Ascona A-Ascona Historic"
  fuel?: string;       // "Benzin"
  transmission?: string; // "Schaltgetriebe" / "Automatik"
  picker?: string;     // "gültiges Pickerl" (oder andere Tags)

  year?: number;       // EZ (Jahr)
  km?: number;         // Kilometer
  ps?: number;         // PS
  kw?: number;         // kW

  sellerType?: string; // "Privat" / "Händler"
  location?: string;   // "4400 Steyr"
  priceEur?: number;   // 27000

  image?: string;      // img src
}