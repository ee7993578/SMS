import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import { FormField, Input, Select } from '../ui/FormField'
import { TableWrap, Th, Td, Tr } from '../ui/Table'
import Button from '../ui/Button'

const FEE_ROWS = [
  { head: 'Tuition Fee',   amount: 5000, paid: 5000, balance: 0 },
  { head: 'Computer Fee',  amount: 500,  paid: 500,  balance: 0 },
  { head: 'Sports Fee',    amount: 300,  paid: 0,    balance: 300 },
  { head: 'Library Fee',   amount: 200,  paid: 0,    balance: 200 },
  { head: 'Exam Fee',      amount: 400,  paid: 0,    balance: 400 },
]

export default function CollectFee() {
  return (
    <div className="page-animate space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">Fee Collection</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Collect fee from students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Search student */}
        <Card>
          <CardHeader><CardTitle>Search Student</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <FormField label="Student Search">
              <Input placeholder="Enter name, roll no, or admission no..." />
            </FormField>
            <Button>Search</Button>
            <div className="p-3.5 bg-blue-50 dark:bg-indigo-500/[0.08] border border-blue-200 dark:border-indigo-500/20 rounded-[10px]">
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Aarav Sharma — Class X-A</p>
              <div className="grid grid-cols-2 gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                <span>Admission No: APS/2024/1042</span>
                <span>Father: Ramesh Sharma</span>
                <span>Contact: +91 98765 43210</span>
                <span>Section: A</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Fee details */}
        <Card>
          <CardHeader><CardTitle>Fee Details</CardTitle></CardHeader>
          <CardBody className="p-0">
            <TableWrap>
              <thead>
                <tr><Th>Fee Head</Th><Th>Amount</Th><Th>Paid</Th><Th>Balance</Th></tr>
              </thead>
              <tbody>
                {FEE_ROWS.map((r, i) => (
                  <Tr key={i}>
                    <Td>{r.head}</Td>
                    <Td>₹{r.amount}</Td>
                    <Td>₹{r.paid}</Td>
                    <Td>
                      <strong className={r.balance === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        ₹{r.balance}
                      </strong>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-[rgba(99,102,241,0.1)]">
              <strong className="text-slate-800 dark:text-slate-100">Total Due: ₹900</strong>
              <Button>Collect Payment</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
