// const-assertion, makes TS see the array values as literals
export const postPreviewLgStyles = ["LgDefault", "LgCard", "LgCardNoThumb", "LgCardHorizNoThumb"] as const
export const postPreviewSmStyles = ["SmDefault", "SmCardHoriz", "SmCardHorizNoThumb"] as const
export const postPreviewAllStyles = [...postPreviewLgStyles, ...postPreviewSmStyles] as const

// so we can make types from arrays, useful for .map
export type postPreviewLgStyle = typeof postPreviewLgStyles[number]
export type postPreviewSmStyle = typeof postPreviewSmStyles[number]
export type postPreviewAllStyle = typeof postPreviewAllStyles[number]