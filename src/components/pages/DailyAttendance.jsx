import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import { FormGrid, FormField, Input, Select } from '../ui/FormField'
import { TableWrap, Th, Td, Tr } from '../ui/Table'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const STUDENTS = [
  { roll: '001', name: 'Aarav Sharma',  status: 'P' },
  { roll: '002', name: 'Priya Verma',   status: 'P' },
  { roll: '003', name: 'Rahul Gupta',   status: 'A' },
  { roll: '004', name: 'Ananya Singh',  status: 'P' },
  { roll: '005', name: 'Karan Mehta',   status: 'P' },
  { roll: '006', name: 'Riya Patel',    status: 'P' },
  { roll: '007', name: 'Arjun Nair',    status: 'A' },
  { roll: '008', name: 'Sneha Yadav',   status: 'P' },
]

export default function DailyAttendance() {
  return (
    <div className="page-animate space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">Daily Attendance</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Mark and view daily student attendance</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Select Class</CardTitle></CardHeader>
        <CardBody>
          <FormGrid cols={2}>
            <FormField label="Class & Section">
              <Select><option>Class X - A</option><option>Class X - B</option><option>Class IX - A</option></Select>
            </FormField>
            <FormField label="Date">
              <Input type="date" defaultValue="2026-05-14" />
            </FormField>
          </FormGrid>
          <Button className="mt-4">Load Attendance</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance — Class X-A | 14 May 2026</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="green">P: 6</Badge>
            <Badge variant="red">A: 2</Badge>
            <Button size="sm">Save</Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <TableWrap>
            <thead>
              <tr>
                <Th>#</Th><Th>Roll No</Th><Th>Student Name</Th>
                <Th>Status</Th><Th>Remarks</Th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td>{s.roll}</Td>
                  <Td><strong className="dark:text-slate-100">{s.name}</strong></Td>
                  <Td>
                    <Select className="w-24 !py-1 !text-[12px]" defaultValue={s.status}>
                      <option>P</option><option>A</option><option>L</option><option>HD</option>
                    </Select>
                  </Td>
                  <Td>
                    <input
                      type="text"
                      placeholder="Optional"
                      className="w-32 px-2 py-1 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded text-[12px] outline-none focus:border-blue-400 dark:focus:border-indigo-400 bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
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
