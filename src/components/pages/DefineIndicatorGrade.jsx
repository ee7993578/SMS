import { Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import { FormGrid, FormField, Input, Select } from '../ui/FormField'
import { TableWrap, Th, Td, Tr } from '../ui/Table'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const GRADES = [
  { name: 'Outstanding',        code: 'A+', min: 90, max: 100, point: 10, remark: 'Excellent' },
  { name: 'Excellent',          code: 'A',  min: 80, max: 89,  point: 9,  remark: 'Very Good' },
  { name: 'Very Good',          code: 'B+', min: 70, max: 79,  point: 8,  remark: 'Good' },
  { name: 'Good',               code: 'B',  min: 60, max: 69,  point: 7,  remark: 'Above Average' },
  { name: 'Satisfactory',       code: 'C',  min: 50, max: 59,  point: 6,  remark: 'Average' },
  { name: 'Needs Improvement',  code: 'D',  min: 35, max: 49,  point: 5,  remark: 'Below Average' },
]

export default function DefineIndicatorGrade() {
  return (
    <div className="page-animate space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">Define Indicator Grade</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Set up grade indicators for assessment evaluation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Indicator Grade</CardTitle>
          <Button size="sm"><Plus size={14} /> Add New</Button>
        </CardHeader>
        <CardBody>
          <FormGrid cols={2}>
            <FormField label="Grade Name"><Input placeholder="e.g., Outstanding" /></FormField>
            <FormField label="Grade Code"><Input placeholder="e.g., A+" /></FormField>
            <FormField label="Min Marks (%)"><Input type="number" placeholder="90" /></FormField>
            <FormField label="Max Marks (%)"><Input type="number" placeholder="100" /></FormField>
            <FormField label="Grade Point"><Input type="number" placeholder="10" /></FormField>
            <FormField label="Remarks"><Input placeholder="Excellent performance" /></FormField>
          </FormGrid>
          <div className="mt-4 flex gap-2">
            <Button>Save Grade</Button>
            <Button variant="outline">Reset</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Existing Indicator Grades</CardTitle></CardHeader>
        <CardBody className="p-0">
          <TableWrap>
            <thead>
              <tr>
                <Th>#</Th><Th>Grade Name</Th><Th>Code</Th>
                <Th>Min %</Th><Th>Max %</Th><Th>Grade Point</Th>
                <Th>Remarks</Th><Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {GRADES.map((g, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td><strong>{g.name}</strong></Td>
                  <Td><Badge variant="blue">{g.code}</Badge></Td>
                  <Td>{g.min}</Td><Td>{g.max}</Td><Td>{g.point}</Td>
                  <Td>{g.remark}</Td>
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
