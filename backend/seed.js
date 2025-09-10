/**
 * Seed default admin user if not exists
 */
const User = require('./models/User');
const bcrypt = require('bcryptjs');

module.exports = async function seedAdmin(){
  try{
    const adminEmail = 'admin@oralvis.com';
    const exists = await User.findOne({ email: adminEmail });
    if(exists) return;
    const hash = await bcrypt.hash('oraladmin', 10);
    await User.create({ name: 'Admin', email: adminEmail, password: hash, role: 'admin' });
    console.log('Default admin created: admin@oralvis.com / oraladmin');
  }catch(e){
    console.error('Seed error', e);
  }
};
