import GovernorateModel from '../../../DB/models/governorate.model.js';

export const addGovernorate = async (req, res) => {
    const { name } = req.body;

    // تحقق إن كانت المحافظة موجودة مسبقًا
    const existing = await GovernorateModel.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "المحافظة موجودة بالفعل" });
    }

    // إنشاء المحافظة
    const newGovernorate = await GovernorateModel.create({ name });

    return res.status(201).json({ message: "تمت إضافة المحافظة بنجاح", data: newGovernorate });
  };

/*export const getGovernorates = async (req, res) => {
    const governorates = await GovernorateModel.find().select("name -_id");
    const count = governorates.length;
    return res.status(200).json({ message: "success", governorates,count});
  };*/
export const getGovernorates = async (req, res) => {
  const governorates = await GovernorateModel.find().select("name");
  const count = governorates.length;
  return res.status(200).json({ message: "success", governorates, count });
};

export const deleteGovernorate = async (req, res) => {
  const { id } = req.params;

    const governorate = await GovernorateModel.findByIdAndDelete(id);

    if (!governorate) {
      return res.status(404).json({ message: "المحافظة غير موجودة" });
    }

    return res.status(200).json({ message: "تم حذف المحافظة بنجاح", deleted: governorate });
 
};


