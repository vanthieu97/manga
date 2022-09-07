import React, { ReactNode, useRef } from 'react'
import { convertStyle, getObjectStyle } from './helpers'
import './styles.css'

const DIRECTION = {
  NONE: 'NONE',
  NEGATIVE: 'NEGATIVE',
  POSITIVE: 'POSITIVE',
}

type FileType = {
  oid: string
  name: string
  objectOIDs: string[]
  objectsMap: object
  bubbleIDs: string[]
  bubblesMap: object
  transform: {
    size: any
    center: any
    rotation: number
  }
  typesetImage: {
    size: { width: number; height: number }
    url: string
  }
}

type PropsType = {
  data: FileType
  selected: string
  scale: number
  setSelected: (path: string) => void
  setData: (values: object) => void
  editText: string
  setEditText: (path: string) => void
}

const Page: React.FC<PropsType> = ({ data, selected, scale, setSelected, setData, editText, setEditText }) => {
  const { oid: id } = data
  const pageRef = useRef<HTMLDivElement>(null)
  const interactRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<boolean>(false)

  const renderImage = () => {
    return <img src={data.typesetImage.url} alt="image" />
  }

  const renderTextObject: (value: any, content: string, path: string) => ReactNode = (
    { style, children },
    content,
    path,
  ) => {
    if (typeof children === 'string') {
      return <div style={convertStyle(style)}>{content}</div>
    }
    return <div style={convertStyle(style)}>{renderTextObject(children[0], content, path)}</div>
  }

  const onMove: (e: any) => void = (e) => {
    if (!pageRef.current || !interactRef.current || draggingRef.current) {
      return
    }
    draggingRef.current = true
    let shiftX = e.clientX / scale - interactRef.current.getBoundingClientRect().x
    let shiftY = e.clientY / scale - interactRef.current.getBoundingClientRect().y
    const onDrag: (e: any) => void = (e) => {
      if (!pageRef.current || !interactRef.current) {
        return
      }
      const rect = pageRef.current.getBoundingClientRect()
      interactRef.current.style.left = `${e.pageX / scale - shiftX - rect.x}px`
      interactRef.current.style.top = `${e.pageY / scale - shiftY - rect.y}px`
    }
    const onDragEnd: (e: any) => void = (e) => {
      if (!pageRef.current || !interactRef.current) {
        return
      }
      draggingRef.current = false
      pageRef.current.removeEventListener('mousemove', onDrag)
      pageRef.current.removeEventListener('mouseup', onDragEnd)
      const x = parseFloat(interactRef.current.style.left)
      const y = parseFloat(interactRef.current.style.top)
      const paths = selected.split('.')
      const updatedData = { ...data }
      const object = (updatedData.objectsMap as any)[paths[1]]
      object.transform.center = {
        x: x + object.transform.size.width / 2,
        y: y + object.transform.size.height / 2,
      }
      setData(updatedData)
    }
    pageRef.current.addEventListener('mousemove', onDrag)
    pageRef.current.addEventListener('mouseup', onDragEnd)
  }

  const onReSize: (horizontal: string, vertical: string) => (e: any) => void = (horizontal, vertical) => (e) => {
    if (!pageRef.current || !interactRef.current || draggingRef.current) {
      return
    }
    draggingRef.current = true
    const offsetX = e.clientX / scale
    const offsetY = e.clientY / scale
    const pageRect = pageRef.current.getBoundingClientRect()
    const interactRect = interactRef.current.getBoundingClientRect()
    const width = interactRect.width
    const height = interactRect.height
    const right = interactRect.x + width - pageRect.x
    const bottom = interactRect.y + height - pageRect.y
    const onDrag: (e: any) => void = (e) => {
      if (!pageRef.current || !interactRef.current) {
        return
      }
      let deltaX = e.pageX / scale - offsetX,
        deltaY = e.pageY / scale - offsetY
      switch (horizontal) {
        case DIRECTION.POSITIVE:
          interactRef.current.style.width = `${width + deltaX}px`
          break
        case DIRECTION.NEGATIVE:
          interactRef.current.style.left = `${right - width + deltaX}px`
          interactRef.current.style.width = `${width - deltaX}px`
          break
        default:
          break
      }
      switch (vertical) {
        case DIRECTION.POSITIVE:
          interactRef.current.style.height = `${height + deltaY}px`
          break
        case DIRECTION.NEGATIVE:
          interactRef.current.style.top = `${bottom - height + deltaY}px`
          interactRef.current.style.height = `${height - deltaY}px`
          break
        default:
          break
      }
    }
    const onDragEnd: (e: any) => void = (e) => {
      if (!pageRef.current || !interactRef.current) {
        return
      }
      draggingRef.current = false
      pageRef.current.removeEventListener('mousemove', onDrag)
      pageRef.current.removeEventListener('mouseup', onDragEnd)
      const x = parseFloat(interactRef.current.style.left)
      const y = parseFloat(interactRef.current.style.top)
      const width = parseFloat(interactRef.current.style.width)
      const height = parseFloat(interactRef.current.style.height)
      const paths = selected.split('.')
      const updatedData = { ...data }
      const object = (updatedData.objectsMap as any)[paths[1]]
      object.transform.center.x = x + width / 2
      object.transform.size.width = width
      object.transform.center.y = y + height / 2
      object.transform.size.height = height
      setData(updatedData)
    }
    pageRef.current.addEventListener('mousemove', onDrag)
    pageRef.current.addEventListener('mouseup', onDragEnd)
  }

  const onRotate: (e: any) => void = (e) => {
    if (!pageRef.current || draggingRef.current || !e.altKey) {
      return
    }
    draggingRef.current = true
    const offsetX = e.clientX
    let degree: number
    const onDrag: (e: any) => void = (e) => {
      if (!interactRef.current) {
        return
      }
      const x = e.pageX
      degree = ((x - offsetX) / 100) * 180
      interactRef.current.style.transform = `rotate(${degree}deg)`
    }
    const onDragEnd: (e: any) => void = (e) => {
      if (!pageRef.current || !interactRef.current) {
        return
      }
      draggingRef.current = false
      pageRef.current.removeEventListener('mousemove', onDrag)
      pageRef.current.removeEventListener('mouseup', onDragEnd)
      const paths = selected.split('.')
      const updatedData = { ...data }
      const object = (updatedData.objectsMap as any)[paths[1]]
      object.transform.rotation = degree
      setData(updatedData)
    }
    pageRef.current.addEventListener('mousemove', onDrag)
    pageRef.current.addEventListener('mouseup', onDragEnd)
  }

  const renderDots = () => {
    return (
      <div className="dot-wrap" onMouseDown={onMove}>
        <div className="line"></div>
        <div className="dot dot-corner dot-rotate" onMouseDown={onRotate}></div>
        <div className="dot dot-side dot-left" onMouseDown={onReSize(DIRECTION.NEGATIVE, DIRECTION.NONE)}></div>
        <div className="dot dot-side dot-right" onMouseDown={onReSize(DIRECTION.POSITIVE, DIRECTION.NONE)}></div>
        <div className="dot dot-side dot-top" onMouseDown={onReSize(DIRECTION.NONE, DIRECTION.NEGATIVE)}></div>
        <div className="dot dot-side dot-bottom" onMouseDown={onReSize(DIRECTION.NONE, DIRECTION.POSITIVE)}></div>
        <div
          className="dot dot-corner dot-top-left"
          onMouseDown={onReSize(DIRECTION.NEGATIVE, DIRECTION.NEGATIVE)}
        ></div>
        <div
          className="dot dot-corner dot-bottom-left"
          onMouseDown={onReSize(DIRECTION.NEGATIVE, DIRECTION.POSITIVE)}
        ></div>
        <div
          className="dot dot-corner dot-top-right"
          onMouseDown={onReSize(DIRECTION.POSITIVE, DIRECTION.NEGATIVE)}
        ></div>
        <div
          className="dot dot-corner dot-bottom-right"
          onMouseDown={onReSize(DIRECTION.POSITIVE, DIRECTION.POSITIVE)}
        ></div>
      </div>
    )
  }

  const renderObjects = () => {
    return data.objectOIDs.map((objectOID) => {
      const { oid, transform, translation, type, imageURL, transcription } = (data.objectsMap as any)[objectOID]
      const path = `${id}.${oid}`
      const condition = editText !== oid && selected === path
      return (
        <div
          ref={condition ? interactRef : null}
          key={objectOID}
          className={`object-wrap ${condition ? 'selected' : editText === oid ? 'editing' : ''}`}
          style={getObjectStyle(transform)}
          onClick={() => {
            setSelected(path)
            if (editText) {
              setEditText(oid)
            }
          }}
          onDoubleClick={() => {
            selected === path && setEditText(oid)
          }}
        >
          {type === 'text' && renderTextObject(translation.value, transcription.value, path)}
          {type === 'visual-asset' && <img src={imageURL} alt={oid} className="visual-asset" />}
          {condition && renderDots()}
        </div>
      )
    })
  }

  return (
    <div className="page-wrap">
      <div className="page" ref={pageRef}>
        {renderImage()}
        {renderObjects()}
      </div>
    </div>
  )
}

export default React.memo(Page)
