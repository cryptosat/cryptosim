
class delay_encryption{
   #clock = null;
   #database = {};
   
   constructor(){
        this.#clock = new Date();
        setInterval(timer, 1000);
   }

   timer(){
       for(i = 0; i < this.#database.length; i++){
           if(this.#database[index].time_to_release == 0){
               continue
           }

           this.#database[i].time_to_release--;
       }
   }

   create_keypair(time_to_release){
        keypair = {
                    "id": "",
                    "time_to_release": time_to_release,
                    "public_key": "",
                    "private_key": "",};

        this.#database.push(keypair);
   }

   delete_keypair(id){
        for(let i = 0; i < this.#database.length; i++){
            if(this.#database[i].id == id){
                this.#database.splice(i);
            }
        }
   }

   list_delayed_keypairs(){
       var keypairs_list = {};
       for(i = 0; i < this.#database.length; i++){
            var keypair = {
                            "time_to_release": this.#database[i].time_to_release,
                            "public_key": this.#database[i].public_key
                        };

            keypairs_list.push(keypair);
       }

       return keypairs_list;
   }

   fetch_public_key(id){
       for(i = 0; i < this.#database.length; i++){
           if(this.#database[i].id == id){
               return this.#database[i].public_key;
           }
       }
   }

   fetch_private_key(id){
        for(i = 0; i < this.#database.length; i++){
           if(this.#database[i].id == id){
               return this.#database[i].private_key;
           }
       }
   }
}

module.exports = DelayEncryption;