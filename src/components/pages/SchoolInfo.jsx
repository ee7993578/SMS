import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import { FormGrid, FormField, Input, Select, Textarea } from '../ui/FormField'
import Button from '../ui/Button'

export default function SchoolInfo() {
  return (
    <div className="page-animate space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">School Information</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Manage school profile and basic information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Profile</CardTitle>
          <Button size="sm">Save Changes</Button>
        </CardHeader>
        <CardBody>
          <FormGrid cols={2}>
            <FormField label="School Name">
              <Input defaultValue="APS International School" />
            </FormField>
            <FormField label="School Code">
              <Input defaultValue="APS2024" />
            </FormField>
            <FormField label="Affiliation Board">
              <Select><option>CBSE</option><option>ICSE</option><option>State Board</option></Select>
            </FormField>
            <FormField label="Affiliation No.">
              <Input defaultValue="2130456" />
            </FormField>
            <FormField label="Principal Name">
              <Input defaultValue="Dr. Meera Sharma" />
            </FormField>
            <FormField label="Contact Number">
              <Input type="tel" defaultValue="+91 9876543210" />
            </FormField>
            <FormField label="Email Address">
              <Input type="email" defaultValue="info@apsinternational.edu.in" />
            </FormField>
            <FormField label="Website">
              <Input defaultValue="www.apsinternational.edu.in" />
            </FormField>
            <FormField label="Address" fullWidth>
              <Textarea rows={2} defaultValue="Sector 12, Meerut, Uttar Pradesh - 250001" />
            </FormField>
          </FormGrid>
        </CardBody>
      </Card>
    </div>
  )
}
