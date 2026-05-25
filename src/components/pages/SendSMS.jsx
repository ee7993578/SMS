import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import { FormField, Select, Textarea } from '../ui/FormField'
import { TableWrap, Th, Td, Tr } from '../ui/Table'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const HISTORY = [
  { date: '14 May', type: 'Fee Reminder',   sent: 284,  status: 'Delivered' },
  { date: '12 May', type: 'Holiday Notice', sent: 1284, status: 'Delivered' },
  { date: '10 May', type: 'Exam Schedule',  sent: 1284, status: 'Delivered' },
  { date: '05 May', type: 'Result Notice',  sent: 645,  status: 'Partial' },
]

export default function SendSMS() {
  return (
    <div className="page-animate space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">Send SMS</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Send bulk or individual SMS to students and parents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compose */}
        <Card>
          <CardHeader><CardTitle>Compose Message</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <FormField label="Send To">
              <Select>
                <option>All Parents</option><option>All Students</option>
                <option>Class-wise</option><option>Individual</option>
              </Select>
            </FormField>
            <FormField label="Class (if class-wise)">
              <Select>
                <option>All Classes</option><option>Class X</option>
                <option>Class IX</option><option>Class VIII</option>
              </Select>
            </FormField>
            <FormField label="Template">
              <Select>
                <option>Custom</option><option>Fee Reminder</option>
                <option>Exam Schedule</option><option>Holiday Notice</option>
              </Select>
            </FormField>
            <FormField label="Message">
              <Textarea
                rows={4}
                defaultValue="Dear Parent, This is to inform you that the Annual Exam schedule has been released. Please visit the school portal for details. - APS International School"
              />
            </FormField>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Characters: 186/160 (2 SMS)</p>
            <Button>Send Now</Button>
          </CardBody>
        </Card>

        {/* History */}
        <Card>
          <CardHeader><CardTitle>SMS History</CardTitle></CardHeader>
          <CardBody className="p-0">
            <TableWrap>
              <thead>
                <tr><Th>Date</Th><Th>Type</Th><Th>Sent</Th><Th>Status</Th></tr>
              </thead>
              <tbody>
                {HISTORY.map((h, i) => (
                  <Tr key={i}>
                    <Td>{h.date}</Td>
                    <Td>{h.type}</Td>
                    <Td>{h.sent}</Td>
                    <Td>
                      <Badge variant={h.status === 'Delivered' ? 'green' : 'orange'}>
                        {h.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
