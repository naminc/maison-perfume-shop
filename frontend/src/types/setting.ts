export interface MaintenanceStatus {
  enabled: boolean;
  message: string;
}

export interface PublicSettings {
  store_name: string;
  domain: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  icon: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  maintenance: MaintenanceStatus;
}
