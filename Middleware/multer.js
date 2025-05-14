const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })

const storage= multer.diskStorage({})


// const fileFilter=  (req, file, callback)=>{
//     console.log(file)
//     if(!file.mimeType.includes('image')){
//        return callback('invalid image format', false)
//     }
//     callback(null, true)
    
// }

const fileFilter=  (req, file, callback)=>{
    console.log(file)

    if(!file.mimetype.startsWith('image')){
       return callback('invalid image format', false)
    }
    callback(null, true)
    
}



module.exports= multer({storage, fileFilter})

// module.exports= multer({storage})