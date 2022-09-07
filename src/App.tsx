import { useEffect, useState } from 'react'
import { Layout, PageHeader } from 'antd'
import Sidebar from './components/Sidebar'
import initialValues from './shared/data.json'
import Page from './components/Page'
import './App.css'

const App = () => {
  const [scale, setScale] = useState(0 || 614 / 1600)
  const [data, setData] = useState(initialValues)
  const [selected, setSelected] = useState('ls-cFile-448310.text-tOYaiWL1l5jggPIJCQa6w')
  const [editText, setEditText] = useState<string>('')

  useEffect(() => {
    const root = document.querySelector(':root') as HTMLElement
    root.style.setProperty('--zoom', scale.toString())
    document.addEventListener(
      'keyup',
      (e) => {
        if (e.which === 27) {
          setEditText((value: string) => {
            if (value) {
              return ''
            }
            setSelected('')
            return value
          })
        }
      },
      true,
    )
  }, [])

  const onUpdateData = (fileData: object) => {
    const updatedData = { ...data }
    const [fileID] = selected.split('.')
    updatedData.filesMap = { ...updatedData.filesMap, [fileID]: fileData }
    setData(updatedData)
  }

  const renderPages = () => {
    return data.fileOIDs.map((fileOID) => {
      return (
        <Page
          key={fileOID}
          data={(data.filesMap as any)[fileOID]}
          selected={selected}
          scale={scale}
          setSelected={setSelected}
          setData={onUpdateData}
          editText={editText}
          setEditText={setEditText}
        />
      )
    })
  }

  return (
    <div className="app-wrap">
      <PageHeader
        breadcrumb={{
          routes: [
            { path: '', breadcrumbName: data.title },
            { path: '', breadcrumbName: data.name },
          ],
        }}
        className="header-wrap"
      />
      <Layout className="layout-wrap">
        <div className="content" style={{ zoom: scale }}>
          {renderPages()}
        </div>
        <Layout.Sider width={300} theme="light">
          <Sidebar />
        </Layout.Sider>
      </Layout>
    </div>
  )
}

export default App
