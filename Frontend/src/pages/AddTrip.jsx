import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import { Upload, X, Image as ImageIcon, ClipboardList, Receipt, UserCheck, CreditCard, Camera } from 'lucide-react'
import { toast } from 'react-toastify';

const AddTrips = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const {addTrip, uploadReceipts} = useTrip();

  const [receiptFiles, setReceiptFiles] = useState([])
  const [receiptPreviews, setReceiptPreviews] = useState([])

  const [formData, setFormData] = useState({
    Vehicle_Number: '',
    route: '',
    tripDate: '',
    totalIncome: '',
    fuelCost: '',
    driverAllowance: {
      totalSalary: 7000,
      bonus: 0,
      paid: 0
    },
    hamaali: '',
    paidTransport: '',
    maintenanceCost: '',
    otherExpenses: '',
    commission: '',
    pendingAmount: '',
    paymentStatus: 'Pending',
    phonePai: '',
    commissionPaymentDate: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    
    
    if (name.startsWith('driverAllowance.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        driverAllowance: {
          ...formData.driverAllowance,
          [field]: value === '' ? '' : Number(value)
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleReceiptChange = (e)=>{
    const files = Array.from(e.target.files);

    const validFiles = files.filter(file=>{
      if(file.size > 5 * 1024 * 1024){ 
        alert(`File ${file.name} exceeds the 5MB size limit and will be skipped.`)
        return false;
      }
      return true;
    })

    if (validFiles.length > 0) {
      setReceiptFiles([...receiptFiles, ...validFiles])
      

      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setReceiptPreviews(prev => [...prev, reader.result])
        }
        reader.readAsDataURL(file)
      })
      
      setError('')
    }

  }

  const handleRemoveReceipt = (index) => {
    setReceiptFiles(receiptFiles.filter((_, i) => i !== index))
    setReceiptPreviews(receiptPreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const sanitizedData = {
      ...formData,
      totalIncome: Number(formData.totalIncome) || 0,
      fuelCost: Number(formData.fuelCost) || 0,
      hamaali: Number(formData.hamaali) || 0,
      paidTransport: Number(formData.paidTransport) || 0,
      maintenanceCost: Number(formData.maintenanceCost) || 0,
      otherExpenses: Number(formData.otherExpenses) || 0,
      commission: Number(formData.commission) || 0,
      pendingAmount: Number(formData.pendingAmount) || 0,
      phonePai: Number(formData.phonePai) || 0,
      commissionPaymentDate: formData.commissionPaymentDate || null
    };

    try {
      setLoading(true)
      const result = await addTrip(sanitizedData);
      
      if (result.success) {
        const tripId = result.data?.tripExpense?._id;
        
        if (receiptFiles.length > 0 && tripId) {
          await handleUploadReceipts(tripId)
        }
        toast.success("Trip added successfully!");
        setSuccess('Trip added successfully!')
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        setError(result.message || 'Failed to add trip')
        toast.error(result.message || 'Failed to add trip');
      }
      
    } catch (error) {
      toast.error('Failed to add trip');
      setError('Failed to add trip')
    } finally {
      setLoading(false)
    }
  }

   const handleUploadReceipts = async (tripId) => {
    try {
     
      for (const file of receiptFiles) {
        const uploadResult = await uploadReceipts(tripId,file);
        
        
        if(!uploadResult.success){
          setError(uploadResult.message || 'Failed to upload some receipts')
          toast.error(uploadResult.message || 'Failed to upload some receipts');
        }else{
          toast.success('Receipts uploaded successfully!');
        }

      }      
      }
     catch (error) {
      console.error('Receipt upload error:', error)
    }
  }


  return (
    <div className='min-h-screen bg-stone-100 p-4 md:p-8'>
      <div className='max-w-5xl mx-auto'>

        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl md:text-5xl font-black uppercase tracking-tight border-b-4 border-black inline-block pb-2 bg-yellow-400 px-4 transform -rotate-1'>
            Add New Trip
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className='bg-white border-4 border-black px-4 py-2 font-black uppercase text-sm hover:bg-yellow-400 transition-colors'
          >
            ← Back
          </button>
        </div>


        {error && (
          <div className='mb-6 p-4 bg-red-500 border-4 border-black text-white font-bold uppercase text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            {error}
          </div>
        )}

        {success && (
          <div className='mb-6 p-4 bg-green-400 border-4 border-black text-black font-bold uppercase text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            {success}
          </div>
        )}


        <form onSubmit={handleSubmit} className='bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'>


          <div className='bg-yellow-400 border-b-4 border-black p-4'>
            <h2 className='text-xl md:text-2xl font-black uppercase flex items-center gap-2'>
              <ClipboardList size={22} strokeWidth={3} />
              Basic Information
            </h2>
          </div>

          <div className='p-6 space-y-6'>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Vehicle Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='Vehicle_Number'
                  value={formData.Vehicle_Number}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow uppercase'
                  placeholder='MH20B0000'
                  required />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Route <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='route'
                  value={formData.route}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='Route'
                  required />
              </div>
            </div>


            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Trip Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  name='tripDate'
                  value={formData.tripDate}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow uppercase'
                  required />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Total Income <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='totalIncome'
                  value={formData.totalIncome}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0'
                  required />
              </div>
            </div>
          </div>


          <div className='bg-red-400 border-t-4 border-b-4 border-black p-4'>
            <h2 className='text-xl md:text-2xl font-black uppercase flex items-center gap-2'>
              <Receipt size={22} strokeWidth={3} />
              Expenses
            </h2>
          </div>

          <div className='p-6 space-y-6'>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Fuel Cost
                </label>
                <input
                  type='number'
                  name='fuelCost'
                  value={formData.fuelCost}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Hamaali (Loading/Unloading)
                </label>
                <input
                  type='number'
                  name='hamaali'
                  value={formData.hamaali}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>
            </div>


            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Paid Transport
                </label>
                <input
                  type='number'
                  name='paidTransport'
                  value={formData.paidTransport}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Maintenance Cost
                </label>
                <input
                  type='number'
                  name='maintenanceCost'
                  value={formData.maintenanceCost}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>
            </div>


            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Commission
                </label>
                <input
                  type='number'
                  name='commission'
                  value={formData.commission}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Commission Payment Date
                </label>
                <input
                  type='date'
                  name='commissionPaymentDate'
                  value={formData.commissionPaymentDate}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow uppercase'
                  required />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Other Expenses
                </label>
                <input
                  type='number'
                  name='otherExpenses'
                  value={formData.otherExpenses}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>
            </div>
          </div>


          <div className='bg-green-400 border-t-4 border-b-4 border-black p-4'>
            <h2 className='text-xl md:text-2xl font-black uppercase flex items-center gap-2'>
              <UserCheck size={22} strokeWidth={3} />
              Driver Allowance
            </h2>
          </div>

          <div className='p-6 space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Total Salary
                </label>
                <input
                  type='number'
                  name='driverAllowance.totalSalary'
                  value={formData.driverAllowance.totalSalary}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='7000' />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Bonus
                </label>
                <input
                  type='number'
                  name='driverAllowance.bonus'
                  value={formData.driverAllowance.bonus}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Paid Amount
                </label>
                <input
                  type='number'
                  name='driverAllowance.paid'
                  value={formData.driverAllowance.paid}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>
            </div>


            <div className='bg-yellow-400 border-4 border-black p-4'>
              <p className='font-black uppercase text-sm'>
                Remaining Driver Payment: ₹
                {(formData.driverAllowance.totalSalary + formData.driverAllowance.bonus - formData.driverAllowance.paid).toLocaleString('en-IN')}
              </p>
            </div>
          </div>


          <div className='bg-orange-400 border-t-4 border-b-4 border-black p-4'>
            <h2 className='text-xl md:text-2xl font-black uppercase flex items-center gap-2'>
              <CreditCard size={22} strokeWidth={3} />
              Payment Status
            </h2>
          </div>

          <div className='p-6 space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Pending Amount
                </label>
                <input
                  type='number'
                  name='pendingAmount'
                  value={formData.pendingAmount}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>

              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Payment Status
                </label>
                <select
                  name='paymentStatus'
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                >
                  <option value='Pending'>Pending</option>
                  <option value='Cleared'>Cleared</option>
                </select>
              </div>
              <div>
                <label className='block font-black uppercase text-sm mb-2 tracking-tight'>
                  Phone Pai
                </label>
                <input type="number"
                  name='phonePai'
                  value={formData.phonePai}
                  onChange={handleChange}
                  className='w-full p-3 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                  placeholder='0' />
              </div>
            </div>
          </div>

          {/* Receipt Upload Section */}
          <div className='bg-purple-400 border-t-4 border-b-4 border-black p-4'>
            <h2 className='text-xl md:text-2xl font-black uppercase flex items-center gap-2'>
              <Camera size={22} strokeWidth={3} />
              Payment Receipts
            </h2>
          </div>

          <div className='p-6 space-y-6'>
            <div className='border-4 border-black p-6 bg-purple-50'>
              <label className='font-black uppercase text-sm mb-4 flex items-center gap-2'>
                <Upload size={18} strokeWidth={3} />
                Upload Payment Receipts (Optional)
              </label>

              <div className='mb-4'>
                <label className='block'>
                  <div className='border-4 border-black p-6 text-center cursor-pointer hover:bg-yellow-400 transition-colors bg-white'>
                    <input
                      type='file'
                      accept='image/*,.pdf'
                      multiple
                      onChange={handleReceiptChange}
                      className='hidden' />
                    <ImageIcon size={40} className='mx-auto mb-2' strokeWidth={2} />
                    <p className='font-bold uppercase text-sm'>
                      Click to upload receipts
                    </p>
                    <p className='text-xs font-bold text-gray-600 mt-1'>
                      JPG, PNG, PDF (Max 5MB each)
                    </p>
                  </div>
                </label>
              </div>

              {/* Receipt Previews */}
              {receiptPreviews.length > 0 && (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                  {receiptPreviews.map((preview, index) => (
                    <div key={index} className='relative border-4 border-black bg-white'>
                      <button
                        type='button'
                        onClick={() => handleRemoveReceipt(index)}
                        className='absolute -top-2 -right-2 bg-red-400 border-2 border-black p-1 hover:bg-black hover:text-red-400 transition-colors z-10'
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                      <img
                        src={preview}
                        alt={`Receipt ${index + 1}`}
                        className='w-full h-24 object-cover' />
                    </div>
                  ))}
                </div>
              )}

              {receiptPreviews.length > 0 && (
                <p className='text-xs font-bold text-gray-600 mt-3'>
                  {receiptPreviews.length} receipt(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className='border-t-4 border-black p-6 bg-stone-50'>
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-black text-yellow-400 font-black text-xl md:text-2xl uppercase py-4 px-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Adding Trip...' : '+ Add Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTrips