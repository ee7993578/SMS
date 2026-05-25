import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import { FormGrid, FormField, Select } from '../ui/FormField'
import { TableWrap, Th, Td, Tr } from '../ui/Table'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const STUDENTS = [
  '001,Aarav Sharma', '002,Priya Verma', '003,Rahul Gupta',
  '004,Ananya Singh', '005,Karan Mehta', '006,Riya Patel',
  '007,Arjun Nair',   '008,Sneha Yadav',
].map(s => { const [roll, name] = s.split(','); return { roll, name } })

export default function DefineMarks({ title = 'Define Marks New' }) {
  return (
    <div className="page-animate space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Configure marks for classes and subjects</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Filter Options</CardTitle></CardHeader>
        <CardBody>
          <FormGrid cols={2}>
            <FormField label="Exam Type">
              <Select>
                <option>Unit Test 1</option><option>Mid Term</option>
                <option>Unit Test 2</option><option>Annual Exam</option>
              </Select>
            </FormField>
            <FormField label="Class">
              <Select>
                {['I','II','III','IV','V','VI','VII','VIII','IX','X'].map(c =>
                  <option key={c}>Class {c}</option>
                )}
              </Select>
            </FormField>
            <FormField label="Section">
              <Select><option>A</option><option>B</option><option>C</option></Select>
            </FormField>
            <FormField label="Subject">
              <Select>
                <option>Mathematics</option><option>Science</option>
                <option>English</option><option>Hindi</option><option>Social Studies</option>
              </Select>
            </FormField>
          </FormGrid>
          <Button className="mt-4">Load Students</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter Marks — Class X-A | Mathematics | Unit Test 1</CardTitle>
          <Button size="sm">Save All Marks</Button>
        </CardHeader>
        <CardBody className="p-0">
          <TableWrap>
            <thead>
              <tr>
                <Th>#</Th><Th>Roll No</Th><Th>Student Name</Th>
                <Th>Max Marks</Th><Th>Marks Obtained</Th><Th>Grade</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td>{s.roll}</Td>
                  <Td><strong>{s.name}</strong></Td>
                  <Td>100</Td>
                  <Td>
                    <input
                      type="number" min="0" max="100"
                      placeholder="—"
                      className="w-20 px-2 py-1.5 border border-slate-200 rounded-md text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                    />
                  </Td>
                  <Td><Badge variant="blue">—</Badge></Td>
                  <Td><Badge variant="orange">Pending</Badge></Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </CardBody>
      </Card>
    </div>
  )
}
