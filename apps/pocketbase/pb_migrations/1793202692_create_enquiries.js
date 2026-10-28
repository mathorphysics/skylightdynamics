migrate((app) => {
  try { app.findCollectionByNameOrId('enquiries'); return; } catch (_) {}
  const collection = new Collection({name:'enquiries',type:'base',listRule:null,viewRule:null,createRule:'',updateRule:null,deleteRule:null,fields:[
    {name:'name',type:'text',required:true,max:150},
    {name:'email',type:'email',required:true},
    {name:'message',type:'text',required:true,min:10,max:5000},
    {name:'created',type:'autodate',onCreate:true,onUpdate:false},
    {name:'updated',type:'autodate',onCreate:true,onUpdate:true}
  ]});
  app.save(collection);
}, (app) => { const collection = app.findCollectionByNameOrId('enquiries'); app.delete(collection); });
