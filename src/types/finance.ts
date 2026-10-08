export type TransactionType = 'Spesa' | 'Risparmio' | 'Entrata';

export interface Transaction {
  id: string;
  nome: string;
  categoria: string;
  importo: number;
  data: string; // ISO String
  tipo: TransactionType;
}

export interface SinkingFund {
  id: string;
  attivita: string;
  stato: 'In corso' | 'Completata';
  obiettivo: number;
  risparmioMensile: number;
  spese: number;
  dataScadenza: string; // ISO String
}

export interface Asset {
  id: string;
  asset: string;
  quantita: number;
  pmc: number;
  prezzoAttuale: number;
}

export interface Debt {
  id: string;
  nome: string;
  valoreDebitoIniziale: number;
  rataMensile: number;
  totalePagato: number;
}

export interface ConfigCategory {
  nome: string;
  tipo: TransactionType;
  emoji: string;
}

export interface Settings {
  liquiditaIniziale: number;
  categorie: ConfigCategory[];
  budgetMensile: number;
}
