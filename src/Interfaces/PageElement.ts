interface PageElement {
  nombre: string;
  tipo: string;
  descripcion?: string;
  ubicacion?: string;
  apariencia?: string;
  keywords?: string[];
  incluir?: (keyof PageElement)[];
  prioridad?: number;
}

export { PageElement };