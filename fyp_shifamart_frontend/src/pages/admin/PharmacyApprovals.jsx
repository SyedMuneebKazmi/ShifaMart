import { useState } from 'react';
import { Check, X, FileText, ExternalLink, Eye, CheckCircle } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Alert from '@components/ui/Alert';

const PharmacyApprovals = () => {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Mock data
  const [applications, setApplications] = useState([
    { 
      id: 1, 
      name: 'HealthCare Pharmacy', 
      owner: 'Muhammad Ali',
      email: 'ali@healthcare.com',
      phone: '+92 300 1234567',
      address: '123 Main St, Lahore',
      license: 'PH-2023-001', 
      date: '2023-10-25', 
      status: 'pending',
      documents: ['License Copy', 'CNIC', 'Premises Lease']
    },
    { 
      id: 2, 
      name: 'City Medical Store', 
      owner: 'Sara Ahmed',
      email: 'sara@citymeds.com',
      phone: '+92 321 9876543',
      address: '456 College Rd, Karachi',
      license: 'PH-2023-045', 
      date: '2023-10-24', 
      status: 'pending',
      documents: ['License Copy', 'CNIC']
    },
    { 
      id: 3, 
      name: 'Wellness Chemist', 
      owner: 'John Doe',
      email: 'john@wellness.com',
      phone: '+92 333 5555555',
      address: '789 Park Ave, Islamabad',
      license: 'PH-2023-089', 
      date: '2023-10-23', 
      status: 'reviewing',
      documents: ['License Copy', 'CNIC', 'Tax Certificate']
    },
  ]);

  const handleView = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsModalOpen(true);
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApplications(prev => prev.filter(app => app.id !== selectedPharmacy.id));
      setIsModalOpen(false);
      setSelectedPharmacy(null);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pharmacy Approvals</h1>
          <p className="text-neutral-500">Review and approve pharmacy registration requests</p>
        </div>
      </div>

      <Card>
        <CardBody>
          {applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Pharmacy Name</th>
                    <th className="px-6 py-3 font-medium">Owner</th>
                    <th className="px-6 py-3 font-medium">License No.</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium">{app.name}</td>
                      <td className="px-6 py-4">{app.owner}</td>
                      <td className="px-6 py-4">{app.license}</td>
                      <td className="px-6 py-4">{app.date}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={app.status === 'reviewing' ? 'info' : 'warning'}
                          size="sm"
                          dot
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleView(app)}
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">All Caught Up!</h3>
              <p>No pending approvals at the moment.</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review Application"
        size="lg"
      >
        {selectedPharmacy && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500 uppercase font-semibold">Pharmacy Name</label>
                <p className="font-medium text-neutral-900">{selectedPharmacy.name}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase font-semibold">License Number</label>
                <p className="font-medium text-neutral-900">{selectedPharmacy.license}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase font-semibold">Owner Name</label>
                <p className="font-medium text-neutral-900">{selectedPharmacy.owner}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase font-semibold">Contact</label>
                <p className="font-medium text-neutral-900">{selectedPharmacy.phone}</p>
                <p className="text-sm text-neutral-600">{selectedPharmacy.email}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-neutral-500 uppercase font-semibold">Address</label>
                <p className="font-medium text-neutral-900">{selectedPharmacy.address}</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <h4 className="font-medium text-neutral-900 mb-3">Submitted Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedPharmacy.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-700">{doc}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Alert variant="info">
              Please verify all documents and license number with the regulatory authority before approving.
            </Alert>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="danger" 
                onClick={() => handleAction('reject')}
                loading={actionLoading}
                leftIcon={<X className="w-4 h-4" />}
              >
                Reject
              </Button>
              <Button 
                variant="primary" 
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                onClick={() => handleAction('approve')}
                loading={actionLoading}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Approve Application
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PharmacyApprovals;
