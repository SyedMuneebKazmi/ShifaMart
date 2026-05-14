import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Modal from '@components/ui/Modal';
import Badge from '@components/ui/Badge';
import Table from '@components/ui/Table';
import medicineService from '@services/medicine';
import Alert from '@components/ui/Alert';

const CATEGORIES = ['Painkiller', 'Antibiotic', 'Antihistamine', 'Antiviral', 'Antifungal', 'Other'];

const InventoryManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const fetchMedicines = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await medicineService.getMedicines();
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setInventory(list.map((m) => ({ ...m, id: m.id || m._id })));
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to load medicines. Showing sample data.');
      setInventory([
        { id: 1, name: 'Panadol', genericName: 'Paracetamol', dosage: '500mg', price: 50, stock: 150, category: 'Painkiller' },
        { id: 2, name: 'Augmentin', genericName: 'Amoxicillin', dosage: '625mg', price: 350, stock: 45, category: 'Antibiotic' },
        { id: 3, name: 'Rigix', genericName: 'Cetirizine', dosage: '10mg', price: 120, stock: 8, category: 'Antihistamine' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    reset({ name: '', genericName: '', category: 'Other', dosage: '', price: '', stock: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    reset({
      name: item.name || '',
      genericName: item.genericName || item.generic || '',
      category: item.category || 'Other',
      dosage: item.dosage || '',
      price: item.price ?? '',
      stock: item.stock ?? '',
      description: item.description || '',
      manufacturer: item.manufacturer || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    setError('');
    try {
      const payload = {
        name: data.name.trim(),
        genericName: data.genericName.trim(),
        category: data.category,
        dosage: data.dosage.trim(),
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        description: data.description?.trim() || undefined,
        manufacturer: data.manufacturer?.trim() || undefined,
      };

      if (editingItem) {
        await medicineService.updateMedicine(editingItem.id || editingItem._id, payload);
        showSuccess('Medicine updated successfully!');
      } else {
        await medicineService.createMedicine(payload);
        showSuccess('Medicine added successfully!');
      }
      await fetchMedicines();
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save medicine. Please try again.';
      setError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineService.deleteMedicine(id);
        showSuccess('Medicine deleted successfully.');
        await fetchMedicines();
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to delete medicine.';
        setError(msg);
      }
    }
  };

  const filteredInventory = inventory.filter(item => {
    const q = searchQuery.toLowerCase();
    const name = (item.name || '').toLowerCase();
    const generic = (item.genericName || item.generic || '').toLowerCase();
    return name.includes(q) || generic.includes(q);
  });

  const columns = [
    {
      key: 'name',
      header: 'Medicine Name',
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-900">{row.name}</p>
          <p className="text-xs text-neutral-500">{row.genericName || row.generic || '—'}</p>
        </div>
      )
    },
    { key: 'category', header: 'Category' },
    { key: 'dosage', header: 'Dosage' },
    {
      key: 'price',
      header: 'Price',
      render: (row) => `Rs. ${row.price}`
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => (
        <Badge
          variant={row.stock > 50 ? 'success' : row.stock > 10 ? 'warning' : 'danger'}
          size="sm"
          dot
        >
          {row.stock > 0 ? `${row.stock} units` : 'Out of Stock'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-red-50"
            onClick={() => handleDelete(row.id || row._id)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Inventory Management</h1>
          <p className="text-neutral-500">Track stock levels and manage medicine details</p>
        </div>
        <Button onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Medicine
        </Button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <Alert variant="success" onClose={() => setSuccessMsg('')}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        </Alert>
      )}
      {error && !isModalOpen && (
        <Alert variant="warning" onClose={() => setError('')}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </Alert>
      )}

      <Card>
        <CardBody>
          {loading && (
            <div className="py-6 text-center text-sm text-neutral-500">
              Loading medicines…
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search medicines by name or generic…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
          </div>

          <Table
            columns={columns}
            data={filteredInventory}
            pagination={{
              page: 1,
              totalPages: 1,
              onPageChange: () => {}
            }}
          />
        </CardBody>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setError(''); }}
        title={editingItem ? 'Edit Medicine' : 'Add New Medicine'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Show API error inside modal */}
          {error && isModalOpen && (
            <Alert variant="danger" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Medicine Name */}
            <div className="col-span-2">
              <Input
                label="Medicine Name"
                {...register('name', { required: 'Medicine name is required' })}
                error={errors.name?.message}
                placeholder="e.g. Panadol"
              />
            </div>

            {/* Generic Name — field MUST be genericName to match backend */}
            <div className="col-span-2">
              <Input
                label="Generic Name"
                {...register('genericName', { required: 'Generic name is required' })}
                error={errors.genericName?.message}
                placeholder="e.g. Paracetamol"
              />
            </div>

            {/* Category dropdown */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
            </div>

            <Input
              label="Dosage"
              {...register('dosage', { required: 'Dosage is required' })}
              error={errors.dosage?.message}
              placeholder="e.g. 500mg"
            />

            <Input
              label="Price (Rs.)"
              type="number"
              {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be ≥ 0' } })}
              error={errors.price?.message}
              placeholder="0"
            />

            <Input
              label="Stock Quantity"
              type="number"
              {...register('stock', { required: 'Stock is required', min: { value: 0, message: 'Must be ≥ 0' } })}
              error={errors.stock?.message}
              placeholder="0"
            />

            <Input
              label="Manufacturer (optional)"
              {...register('manufacturer')}
              placeholder="e.g. GSK"
            />

            {/* Description — full width */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description (optional)
              </label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                placeholder="Brief description of the medicine…"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => { setIsModalOpen(false); setError(''); }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitLoading}>
              {editingItem ? 'Update Medicine' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryManager;
