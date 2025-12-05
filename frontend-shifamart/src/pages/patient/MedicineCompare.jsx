import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Pill, Search, ShoppingCart, Bell, MapPin, Filter } from 'lucide-react';
import medicineService from '@services/medicine';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import Table from '@components/ui/Table';

const MedicineCompare = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState(location.state?.medicines || []);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medicines.length > 0) {
      fetchComparisons();
    }
  }, []);

  const fetchComparisons = async () => {
    setLoading(true);
    try {
      // Mock API call
      // const data = await medicineService.comparePrices(medicines.map(m => m.name));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockResults = [
        {
          id: 1,
          pharmacy: 'HealthPlus Pharmacy',
          distance: '0.8 km',
          totalPrice: 450,
          availability: 'In Stock',
          items: [
            { name: 'Amoxicillin', price: 150, stock: true },
            { name: 'Paracetamol', price: 50, stock: true },
            { name: 'Cetirizine', price: 250, stock: true }
          ]
        },
        {
          id: 2,
          pharmacy: 'City Meds',
          distance: '1.2 km',
          totalPrice: 420,
          availability: 'Partial',
          items: [
            { name: 'Amoxicillin', price: 140, stock: true },
            { name: 'Paracetamol', price: 45, stock: true },
            { name: 'Cetirizine', price: 235, stock: false }
          ]
        },
        {
          id: 3,
          pharmacy: 'MediCare Chemist',
          distance: '2.5 km',
          totalPrice: 480,
          availability: 'In Stock',
          items: [
            { name: 'Amoxicillin', price: 160, stock: true },
            { name: 'Paracetamol', price: 55, stock: true },
            { name: 'Cetirizine', price: 265, stock: true }
          ]
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Add to medicines list if not exists
    if (!medicines.find(m => m.name.toLowerCase() === searchQuery.toLowerCase())) {
      const newMed = { id: Date.now(), name: searchQuery, dosage: 'N/A', quantity: 1 };
      setMedicines([...medicines, newMed]);
      setSearchQuery('');
      // Trigger comparison update
      setTimeout(fetchComparisons, 100);
    }
  };

  const removeMedicine = (id) => {
    const updated = medicines.filter(m => m.id !== id);
    setMedicines(updated);
    if (updated.length > 0) {
      setTimeout(fetchComparisons, 100);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Pill className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Compare Medicine Prices</h1>
          <p className="text-neutral-500">Find the best deals and availability across local pharmacies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Medicine List */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Your Medicine List" />
            <CardBody>
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add medicine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                  <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                    Add
                  </Button>
                </div>
              </form>

              {medicines.length > 0 ? (
                <div className="space-y-2">
                  {medicines.map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div>
                        <p className="font-medium text-neutral-900">{med.name}</p>
                        <p className="text-xs text-neutral-500">{med.dosage} • Qty: {med.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeMedicine(med.id)}
                        className="text-neutral-400 hover:text-danger transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  No medicines added yet.
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Filters" />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="label-base">Max Distance</label>
                  <input type="range" className="w-full accent-primary-500" min="1" max="20" defaultValue="5" />
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>1 km</span>
                    <span>5 km</span>
                    <span>20 km</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="stock-only" className="rounded text-primary-500 focus:ring-primary-500" />
                  <label htmlFor="stock-only" className="text-sm text-neutral-700">In stock only</label>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="open-now" className="rounded text-primary-500 focus:ring-primary-500" />
                  <label htmlFor="open-now" className="text-sm text-neutral-700">Open now</label>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Comparison Results */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900">{result.pharmacy}</h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{result.distance} away</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          Rs. {result.totalPrice}
                        </div>
                        <p className="text-xs text-neutral-500">Total Estimate</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {result.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className={item.stock ? 'text-neutral-700' : 'text-neutral-400 line-through'}>
                            {item.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">Rs. {item.price}</span>
                            <Badge 
                              variant={item.stock ? 'success' : 'danger'} 
                              size="sm" 
                              dot
                              className="w-24 justify-center"
                            >
                              {item.stock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.availability === 'In Stock' ? 'success' : 'warning'}>
                          {result.availability}
                        </Badge>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" leftIcon={<Bell className="w-4 h-4" />}>
                          Notify
                        </Button>
                        <Button size="sm" leftIcon={<ShoppingCart className="w-4 h-4" />}>
                          Order Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-neutral-200">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900">No comparisons yet</h3>
              <p className="text-neutral-500 max-w-sm mt-2">
                Add medicines to your list to see price comparisons from nearby pharmacies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineCompare;
