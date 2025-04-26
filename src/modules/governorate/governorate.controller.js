import GovernorateModel from '../../../DB/models/governorate.model.js';

export const addGovernorate = async (req, res) => {
  try {
    const { name } = req.body;

    // تحقق إن كانت المحافظة موجودة مسبقًا
    const existing = await GovernorateModel.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "المحافظة موجودة بالفعل" });
    }

    // إنشاء المحافظة
    const newGovernorate = await GovernorateModel.create({ name });

    return res.status(201).json({ message: "تمت إضافة المحافظة بنجاح", data: newGovernorate });
  } catch (error) {
    return res.status(500).json({ message: "حدث خطأ أثناء الإضافة", error: error.message });
  }
};

export const getGovernorates = async (req, res) => {
  try {
    const governorates = await GovernorateModel.find().select("name -_id");
    const count = governorates.length;
    return res.status(200).json({ message: "success", governorates,count});
  } catch (error) {
    return res.status(500).json({ message: "internal error", error: error.message });
  }
};
