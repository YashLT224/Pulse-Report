import { Button } from '@aws-amplify/ui-react'
import {
  Table,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  EditIcon,
  TableContainer,
} from './style'

// Define a type for table column configuration
interface TableColumn<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

// Define an interface for editable fields configuration
interface EditableField<T> {
  key: keyof T | string
  label: string
  type: 'text' | 'select' | 'checkbox' // Editable field types
  options?: { name: string; label: string }[] // For dropdowns
}

interface EditableItem {
  [key: string]: any // For any other properties
}

// Define props interface for the component using generics
interface UserListProps<T> {
  heading: string
  items: T[]
  columns?: TableColumn<T>[]
  nameField?: keyof T // Field to show in the modal header
  addNewEntryAccess: boolean
  handleEdit:(item)=>void
  addNewItemHandler:()=>void
}

function UserList<T extends EditableItem>({
  heading,
  items = [],
  columns,
  nameField = 'userName' as keyof T,
  addNewEntryAccess = false,
  handleEdit,
  addNewItemHandler=()=>{}
}: UserListProps<T>) {
  // Default columns if none provided
  const defaultColumns: TableColumn<T>[] = [
    { key: 'userName', header: 'Name' },
    { key: 'phoneNumber', header: 'Phone Number' },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (item) =>
        item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
    },
  ]

  const effectiveColumns = columns || defaultColumns


  return (
    <div>
      <div className='flexbox-between'>
        <h2>{heading}</h2>
        {addNewEntryAccess&&<Button
        style={{backgroundColor:'#197935'}}
          variation="primary"
          loadingText=""
          size="small"
          onClick={addNewItemHandler}
        >
          Add New
        </Button>}
      </div>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              {effectiveColumns.map((column) => (
                <TableHeaderCell key={column.key.toString()}>
                  {column.header}
                </TableHeaderCell>
              ))}
              <TableHeaderCell>Edit</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {items.map((item, index) => (
              <TableRow key={index}>
                {effectiveColumns.map((column) => (
                  <TableCell key={column.key.toString()}>
                    {column.render
                      ? column.render(item)
                      : item[column.key as string]}
                  </TableCell>
                ))}
                <TableCell>
                  <EditIcon onClick={() => handleEdit(item)}>✏️</EditIcon>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

     
    </div>
  )
}

export default UserList
