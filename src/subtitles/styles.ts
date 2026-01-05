export type SubtitleStyle = {
    fontFamily: string
    fontSize: number
    primaryColor: string
    outlineColor: string
    outline:number
    shadow: number
    alignment: 'left' | 'center'| 'right'
    marginL: number
    marginR: number
    marginV: number
    wrapStyle: 0 | 1 | 2
}
export type SubtitleFont = {
  id: SubtitleFontId
  label: string
  /** CSS font-family stack voor de browser preview */
  css: string
  /** Exacte fontnaam zoals FFmpeg/ASS die moet kennen */
  ass: string
  /** (browser) Google Fonts stylesheet url (optioneel) */
  href?: string
}

export type SubtitleFontId = 'roboto' | 'montserrat' | 'helvetica' | 'bold_display'

export const SUBTITLE_FONTS: Record<SubtitleFontId, SubtitleFont> = {
  roboto: {
    id: 'roboto',
    label: 'Roboto',
    css: 'Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    ass: 'Roboto',
    href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap',
  },
  montserrat: {
    id: 'montserrat',
    label: 'Montserrat',
    css: 'Montserrat, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    ass: 'Montserrat',
    href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap',
  },
  helvetica: {
    id: 'helvetica',
    label: 'Helvetica',
    css: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    ass: 'Helvetica Neue',
    // geen href: system font
  },
  bold_display: {
    id: 'bold_display',
    label: 'Bold display',
    css: '"Anton", system-ui, sans-serif',
    ass: 'Anton',
    href: 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
  },
}


export  type  SubtitlePresetId =
    | 'TIKTOK_POP'
    | 'TIKTOK_BAR'
    | 'YT_DEFAULT'
    | 'CINEMATIC'
    | 'ACCESSIBLE'

export type SubtitleStylePreset = {
    id: SubtitlePresetId
    label: string
    description?:string
    style: SubtitleStyle
}

export const SUBTITLE_STYLE_PRESETS: SubtitleStylePreset[] =[
    {
        id: 'TIKTOK_POP',
        label: 'TikTok - Bold Yellow',
        description: "Big Yellow text, with Black Outline for 9:16 shorts.",
        style: {
            fontFamily: 'Inter Semi Bold',
            fontSize: 30,
            primaryColor:'#FFE600',
            outlineColor:'#000000',
            outline:3,
            shadow:1,
            alignment: 'center',
            marginL: 80,
            marginR: 80,
            marginV: 80,
            wrapStyle: 2,
        },
    },
    {
        id: 'TIKTOK_BAR',
        label: 'TikTok - White tekst on dark',
        description: 'White tekst on dark background, readable on busy video',
        style:{
            fontFamily: 'Inter Semi Bold',
            fontSize: 26,
            primaryColor: '#FFF',
            outlineColor: 'rgba(0,0,0,0.7)',
            outline: 2,
            shadow: 0,
            alignment: 'center',
            marginL: 60,
            marginR: 60,
            marginV:70,
            wrapStyle: 2
        },
    },
    {
        id: 'YT_DEFAULT',
        label: 'YouTube – Standaard',
        description: 'Broadcast-achtige ondertitels voor 16:9.',
        style: {
            fontFamily: 'Inter Medium',
            fontSize: 22,
            primaryColor: '#FFFFFF',
            outlineColor: '#000000',
            outline: 2,
            shadow: 1,
            alignment: 'center',
            marginL: 100,
            marginR: 100,
            marginV: 40,
            wrapStyle: 2,
        },
    },{
        id: 'CINEMATIC',
        label: 'Cinematic – Subtiel',
        description: 'Klein, subtiel; voor meer “filmische” content.',
        style: {
            fontFamily: 'Inter Light',
            fontSize: 18,
            primaryColor: '#F5F5F5',
            outlineColor: 'rgba(0,0,0,0.7)',
            outline: 1,
            shadow: 0,
            alignment: 'center',
            marginL: 120,
            marginR: 120,
            marginV: 60,
            wrapStyle: 2,
        },
    }, {
        id: 'ACCESSIBLE',
        label: 'High contrast (pro)',
        description: 'Maximale leesbaarheid voor e-learning / corporate.',
        style: {
            fontFamily: 'Inter Semi Bold',
            fontSize: 24,
            primaryColor: '#000000',
            outlineColor: '#FFFFFF',
            outline: 3,
            shadow: 0,
            alignment: 'center',
            marginL: 90,
            marginR: 90,
            marginV: 50,
            wrapStyle: 2,
        },
    },
]

export function getSubtitleFont(id: SubtitleFontId): SubtitleFont {
    return SUBTITLE_FONTS[id] ?? SUBTITLE_FONTS.roboto
}
export function getSubtitlePreset(id: SubtitlePresetId): SubtitleStylePreset{
    const preset = SUBTITLE_STYLE_PRESETS.find(p => p.id === id)
    return preset ?? SUBTITLE_STYLE_PRESETS[0];
}

