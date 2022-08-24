const nacl = require('tweetnacl');

class delay_encryption {
   database = null;
   number_of_keypairs = null;
   
   constructor() {
        this.database = new Array();
        this.number_of_keypairs = 0;
        setInterval(this.timer.bind(this), 1000);
   }

   timer() {
        for(let i = 0; i < this.number_of_keypairs; i++) {
            if(this.database[i].time_to_release == 0) {
               continue;
            }
           
           this.database[i].time_to_release--;
        }
   }

   create_keypair(time_to_release) {
       const keys = nacl.box.keyPair();

        const keypair = {
                    "id": nacl.hash(keys.publicKey),
                    "time_to_release": time_to_release,
                    "public_key": keys.publicKey,
                    "private_key": keys.secretKey,};

        this.database.push(keypair);
        this.number_of_keypairs = this.number_of_keypairs + 1;
        return keypair.id;
   }

   delete_keypair(id) {
        for(let i = 0; i < this.number_of_keypairs; i++) {
            if(this.database[i].id == id){
                this.database.splice(i, 1);
                this.number_of_keypairs = this.number_of_keypairs - 1;
                return 'success';
            }
        }

        return 'keypair delete failed';
   }

   list_delayed_keypairs() {
       var keypairs_list = [];
       for(let i = 0; i < this.number_of_keypairs; i++) {
            var keypair = {
                            "keypair_id": this.database[i].id,
                            "time_to_release": this.database[i].time_to_release,
                            "public_key": this.database[i].public_key
                        };

            keypairs_list.push(keypair);
       }

       return keypairs_list;
   }

   fetch_public_key(id) {
       for(let i = 0; i < this.number_of_keypairs; i++) {
           if(this.database[i].id == id){
               return this.database[i].public_key;
           }
       }
   }

   fetch_private_key(id) {
        for(let i = 0; i < this.number_of_keypairs; i++){
           if(this.database[i].id == id){
               if(this.database[i].time_to_release == 0) {
                    return this.database[i].private_key;
               }

               return {"time to release is: ": this.database[i].time_to_release};
           }
       }

       return {"no keypair could be found": null};
   }
}

module.exports = {delay_encryption};