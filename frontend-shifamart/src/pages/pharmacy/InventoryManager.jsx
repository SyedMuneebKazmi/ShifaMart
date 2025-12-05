import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Modal from '@components/ui/Modal';
import Badge from '@components/ui/Badge';
import Table from '@components/ui/Table';

const InventoryManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock inventory data
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Panadol', generic: 'Paracetamol', dosage: '500mg', price: 50, stock: 150, category: 'Painkiller' },
    { id: 2, name: 'Augmentin', generic: 'Amoxicillin', dosage: '625mg', price: 350, stock: 45, category: 'Antibiotic' },
    { id: 3, name: 'Rigix', generic: 'Cetirizine', dosage: '10mg', price: 120, stock: 8, category: 'Antihistamine' },
    { id: 4, name: 'Brufen', generic: 'Ibuprofen', dosage: '400mg', price: 80, stock: 200, category: 'Painkiller' },
    { id: 5, name: 'Flagyl', generic: 'Metronidazole', dosage: '400mg', price: 60, stock: 0, category: 'Antibiotic' },
  ]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openAddModal = () => {
    setEditingItem(null);
    reset({});
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    reset(item);
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item));
    } else {
      setInventory(prev => [...prev, { id: Date.now(), ...data }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.generic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      key: 'name', 
      header: 'Medicine Name',
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-900">{row.name}</p>
          <p className="text-xs text-neutral-500">{row.generic}</p>
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
          <Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-danger hover:bg-red-50" onClick={() => handleDelete(row.id)}>
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

      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search medicines by name or generic..."
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Medicine' : 'Add New Medicine'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Medicine Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Generic Name"
                {...register('generic', { required: 'Generic name is required' })}
                error={errors.generic?.message}
              />
            </div>
            <Input
              label="Category"
              {...register('category', { required: 'Category is required' })}
              error={errors.category?.message}
            />
            <Input
              label="Dosage"
              {...register('dosage', { required: 'Dosage is required' })}
              error={errors.dosage?.message}
            />
            <Input
              label="Price (Rs.)"
              type="number"
              {...register('price', { required: 'Price is required', min: 0 })}
              error={errors.price?.message}
            />
            <Input
              label="Stock Quantity"
              type="number"
              {...register('stock', { required: 'Stock is required', min: 0 })}
              error={errors.stock?.message}
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? 'Update Medicine' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryManager;
