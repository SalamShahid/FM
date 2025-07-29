export interface FilterInterface {
  amountMin?: number;
  amountMax?: number;
  category?: string[];
  inflowOroutflow?: string[];
  dateFrom?: string;
  dateTo?: string;
  note?: string[];
}