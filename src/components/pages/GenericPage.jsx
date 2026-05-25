import { Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import { FormGrid, FormField, Input, Select, Textarea } from '../ui/FormField'
import { TableWrap, Th, Td, Tr } from '../ui/Table'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function GenericPage({ moduleLabel, groupLabel, pageLabel }) {
  const rows = Array.from({ length: 5 }, (_, i) => ({
    name: `Record ${i + 1}`,
    code: `CODE-${100 + i}`,
    category: ['A', 'B', 'C', 'A', 'B'][i],
    status: i === 2 ? 'Inactive' : 'Active',
  }))

  return (
    <div className="page-animate space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">{pageLabel}</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          {moduleLabel} › {groupLabel} › {pageLabel}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pageLabel}</CardTitle>
          <Button size="sm"><Plus size={14} /> Add New</Button>
        </CardHeader>
        <CardBody>
          <FormGrid cols={2}>
            <FormField label="Name / Title"><Input placeholder="Enter name or title" /></FormField>
            <FormField label="Code / ID"><Input placeholder="Enter code or ID" /></FormField>
            <FormField label="Category">
              <Select>
                <option>Category A</option><option>Category B</option><option>Category C</option>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select><option>Active</option><option>Inactive</option></Select>
            </FormField>
            <FormField label="Description" fullWidth>
              <Textarea rows={2} placeholder="Enter description..." />
            </FormField>
          </FormGrid>
          <div className="mt-4 flex gap-2">
            <Button>Save</Button>
            <Button variant="outline">Reset</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Records List</CardTitle></CardHeader>
        <CardBody className="p-0">
          <TableWrap>
            <thead>
              <tr>
                <Th>#</Th><Th>Name</Th><Th>Code</Th>
                <Th>Category</Th><Th>Status</Th><Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td><strong className="dark:text-slate-100">{r.name}</strong></Td>
                  <Td>{r.code}</Td>
                  <Td>Category {r.category}</Td>
                  <Td>
                    <Badge variant={r.status === 'Active' ? 'green' : 'orange'}>{r.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="danger" size="sm">Delete</Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </CardBody>
      </Card>
    </div>
  )
}
