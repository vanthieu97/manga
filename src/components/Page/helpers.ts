export const convertStyle = (style: any) => {
  const value = {} as any
  if (style.color) {
    value.color = style.color
  }
  if (style.align) {
    value.textAlign = style.align
  }
  if (style.font) {
    Object.keys(style.font).forEach((key) => {
      value[`font${key.charAt(0).toUpperCase() + key.slice(1)}`] = style.font[key]
    })
  }
  if (style.stroke) {
    value.WebkitTextStrokeWidth = style.stroke.width
    value.WebkitTextStrokeColor = style.stroke.color
  }
  if (style.verticalAlign) {
    value.verticalAlign = style.verticalAlign
  }
  if (style.lineSpacing) {
    value.letterSpacing = style.lineSpacing + 'px'
  }
  return value
}

export const getObjectStyle = (transform: { center: any; size: any; rotation: any }) => {
  const { center, size, rotation } = transform
  return {
    left: center.x - size.width / 2,
    top: center.y - size.height / 2,
    width: size.width,
    height: size.height,
    transform: rotation ? `rotateZ(${rotation}deg)` : ``,
  }
}
