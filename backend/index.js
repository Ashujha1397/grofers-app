const express =  require("express")
const cors =  require("cors")
const mongoose =  require("mongoose")
const dotenv =  require("dotenv")
const Stripe =  require('stripe')


const app =  express()

app.use(cors())

app.use(express.json({limit : "10mb"}))
const PORT =  process.env.PORT ||  8080


//mongodb connection
// console.log(process.env.MONGODB_URL)
mongoose.set('strictQuery',false)
 mongoose.connect("mongodb://golu17012001:monu1234@ac-ev1nifr-shard-00-00.neyhnjk.mongodb.net:27017,ac-ev1nifr-shard-00-01.neyhnjk.mongodb.net:27017,ac-ev1nifr-shard-00-02.neyhnjk.mongodb.net:27017/?ssl=true&replicaSet=atlas-vx7654-shard-0&authSource=admin&retryWrites=true&w=majority")
 .then(()=>console.log("connected to database"))
 .catch((err)=>console.log(err))

//schema
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    confirmPassword: String,
    image: String,
  });

  const userModel = mongoose.model("user", userSchema);

  //api
  app.get("/", (req, res) => {
    res.send("Server is running");
  });
  
  //sign up
  app.post("/signup", async (req, res) => {
    // console.log(req.body);
    const { email } = req.body;
  
    const resultData = await  userModel.findOne({email : email})
    // console.log(resultData)
    if(!resultData){
        const data = userModel(req.body)
                const save = data.save()
                res.send({message:"Successfully sign up",alert : true})
    }
    else{
        res.send({message: "Email id is already registered",alert : false})
    }
    });
 
//login api
app.post("/login", (req, res) => {
  // console.log(req.body);
  const { email } = req.body;
  userModel.findOne({ email: email }, (err, result) => {
    if (result) {
      const dataSend = {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        image: result.image,
      };
      console.log(dataSend);
      res.send({
        message: "Login is successfully",
        alert: true,
        data: dataSend,
      });
    } else {
      res.send({
        message: "Email is not available, please sign up",
        alert: false,
      });
    }
  });
});



// product section

const schemaProduct = mongoose.Schema({
  name: String,
  category:String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product",schemaProduct)



//save product in data 
//api
app.post("/uploadProduct",async(req,res)=>{
    // console.log(req.body)
    const data = await productModel(req.body)
    const datasave = await data.save()
    res.send({message : "Upload successfully"})
})


app.get("/product",async(req,res)=>{
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
}) 


// payment 

console.log(process.env.STRIPE_SECRET_KEY)


const stripe  = new Stripe( "sk_test_51NUUB8SFDjcxM6Xk4QAF8jHMcUDamaXUyNIGp4wHLBrlb6t18Qah9WuosrnwCALDRvQgurJY0oz5Dg33QT34h2xM00QxqCsC59")

app.post("/checkout-payment",async(req,res)=>{

     try{
      const params = {
          submit_type : 'pay',
          mode : "payment",
          payment_method_types : ['card'],
          billing_address_collection : "auto",
          shipping_options : [{shipping_rate : "shr_1NV3HQSFDjcxM6Xklo3bsQy8"}],

          line_items : req.body.map((item)=>{
            return{
              price_data : {
                currency : "inr",
                product_data : {
                  name : item.name,
                  //  images : [item.image]
                },
                unit_amount : item.price * 100,
              },
              adjustable_quantity : {
                enabled : true,
                minimum : 1,
              },
              quantity : item.qty
            }
          }),

          success_url : `${"http://localhost:3000"}/success`,
          cancel_url : `${"http://localhost:3000"}/cancel`,

      }

      
      const session = await stripe.checkout.sessions.create(params)
      // console.log(session)
      res.status(200).json(session.id)
     }
     catch (err){
        res.status(err.statusCode || 500).json(err.message)
     }

})


//server is running
app.listen(PORT,()=>console.log("server is running at port :" + PORT))

