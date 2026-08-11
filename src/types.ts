export type Mode = 'pfp' | 'idcard';

export type CornerStyle = 'square' | 'rounded' | 'bevel';

export interface PhotoAdjustments {
  zoom: number; // 0.5 to 3.0
  panX: number; // offset in px
  panY: number; // offset in px
  rotation: number; // 0, 90, 180, 270
  filter: 'none' | 'cyber' | 'sunset' | 'crisp' | 'vintage' | 'mono' | 'dramatic';
  brightness: number; // 50 to 150
  contrast: number; // 50 to 150
  saturation: number; // 0 to 200
  customColor?: string;
  scanlinesEnabled?: boolean;
}

export type FrameTemplateId = 'studio-emerald' | 'neon-sunset' | 'hacker-cyber' | 'coastal-wave' | 'retro-synth' | 'gold-builder' | 'minimal-tech';

export interface FrameTemplate {
  id: FrameTemplateId;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeLabel: string;
}

export type IDCardStyleId = 'studio-emerald' | 'terminal-dark' | 'neon-ocean' | 'sunset-blaze' | 'holohack-gold' | 'cyber-square';

export interface IDCardStyle {
  id: IDCardStyleId;
  name: string;
  bgGradient: string[];
  textColor: string;
  accentColor: string;
  cardBorder: string;
  headerTitle: string;
}

export interface IDCardData {
  fullName: string;
  handle: string;
  role: string;
  stack: string;
  builderTitle: string;
  statusBadge: 'SHORTLISTED' | 'CONFIRMED BUILDER' | 'VIP HACKER' | 'SPEAKER' | 'ORGANIZER' | 'GOA NOMAD';
  location: string;
  edition: string;
  hackerId: string;
}

export type StickerId = 'goa-hacker' | '0xbuilder' | 'solana-heart' | 'beach-mode' | 'ship-it' | 'vip-pass';

export interface StickerBadge {
  id: StickerId;
  label: string;
  bg: string;
  textColor: string;
  borderColor: string;
}
