export interface Portfolio {
  id: number;
  user_id: number;
  total_value: number;
  created_at: Date;
}

export interface Holding {
  id: number;
  portfolio_id: number;
  asset_name: string;
  quantity: number;
  current_value: number;
}
