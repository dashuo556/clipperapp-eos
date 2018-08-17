

// console.log = function(logstr) {
//   var para = document.createElement("p");
//   var node = document.createTextNode(logstr);
//   para.appendChild(node);

//   var element = document.getElementById("debugOutput");
//   element.appendChild(para);
// }

function get_key_accounts(eos) {

  // eos.getKeyAccounts({"public_key":"EOS_PUBLIC_KEY"})
  // .then((result) => {
  //     console.log(result)
  //   }).catch(error => {
  //     startTimer(eos);
  //   }); 

}

function get_account(eos) {

  eos.getAccount(input_account_name)
  .then((result) => {
      console.log(result);
      console.log(result.permissions);

      for (var i = 0; i < result.permissions.length; i++) 
      {
        p = result.permissions[i];
        console.log(p)
        if (p.perm_name === "active") {
          console.log(p.required_auth);

          required_auth = p.required_auth;
          active_public_key = required_auth.keys[0].key;
          $('#public_key').val(active_public_key);
        }
      }

    }).catch(error => {
      startTimer(eos);
    }); 

}

input_account_name = 'testaccount' 
input_private_key = 'testprivatekey'

function try_claim(eos) {
  eos.transaction(
  {
    actions: [
      {
        account: 'theeosbutton',
        name: 'claimad',
        authorization: [
          {
            actor: input_account_name,
            permission: 'active'
          }
        ],
        data: {
          account: input_account_name
        }
      }
    ]
  }).then((result) => {
    console.log(result)
    startTimer(eos);
  }).catch(error => {
    startTimer(eos);
  });  
}

if (typeof moment.duration.fn.format === 'undefined') {

moment.duration.fn.format = function() {
  var units = [
      { years : '年' },
      { months : '个月'},
      { weeks : '周' },
      { days  : '天' },
      { hours : '小时'},
      { minutes : '分钟'},
      { seconds : '秒'}
  ],
  result = [];
  for(var i =0, len = units.length; i < len; i++) {
      for(var prop in units[i]) {
          var num = this._data[prop];
          if(num > 0) {
              result.push(num + units[i][prop])
          }
      }
  }
  return result.join(' ');
}

}

function FetchTableRows(eos) {

  eos.getTableRows({code:"theeosbutton",scope:"theeosbutton",table:"ebtplayers",lower_bound: input_account_name,limit:1, json:true})
  .then((result) => {
  //	console.log(result)
    if (typeof(result) === 'object') {
      // console.log(result.rows.length);
      console.log(input_account_name);
      
      ret = result.rows.find(function(obj) {
        return obj.account === input_account_name;
      });
      // console.log(ret);
  
  
      if (ret) {
        last_airdrop_claim_time = ret.last_airdrop_claim_time
  //      nowtime = new Date()
        last_claim_time = new Date(last_airdrop_claim_time * 1000)
        
        next_claim_time = new Date(last_claim_time.getTime())
        //next_claim_time.setMinutes(last_claim_time.getMinutes() + 60)
        next_claim_time.setHours(last_claim_time.getHours() + 24)

        // get_key_accounts(eos);

  
        eos.getInfo({})
        .then((info) => {
          // console.log(info);
          head_block_time_str = info.head_block_time
          
          bptime = new Date(head_block_time_str + 'Z');
  
  
          console.log(last_claim_time)
          console.log(next_claim_time)
          console.log(bptime)
          console.log(moment(last_claim_time).format('YYYY-MM-DD HH:mm:ss'));
          console.log(moment(next_claim_time).format('YYYY-MM-DD HH:mm:ss'));
          console.log(moment(bptime).format('YYYY-MM-DD HH:mm:ss'));

          $('#last_claim_time').text(moment(last_claim_time).format('YYYY-MM-DD HH:mm:ss'))
          $('#next_claim_time').text(moment(next_claim_time).format('YYYY-MM-DD HH:mm:ss'))
          $('#bptime').text(moment(bptime).format('YYYY-MM-DD HH:mm:ss'))

          diff_ms = next_claim_time.getTime() - bptime.getTime();

          
          // moment.duration(diff_ms).format();
          
          $('#remain_time').text(moment.duration(diff_ms).format());


          diff = diff_ms / 1000;
          console.log("remain time: " + diff);

          console.log(parseInt(diff / 60 / 60))
          console.log(parseInt((diff / 60) % 60))
          console.log(parseInt(diff % 60))

          if (diff <= 0) {
            console.log("triger claim");
            // try_claim();
            try_claim(eos);
            
          }
          else {

          startTimer(eos);

          }

          

        }).catch(error => {
          console.log(error);

          startTimer(eos);

        });
   
      }
    }
  }).catch(error => {

    startTimer(eos);

  });

}

 

function EosButtonClaim(eos) {
  console.log("EosButtonClaim");

  // ---------------------------------------
  // SETTING UP AN EOS SIGNATURE PROVIDER
  // ---------------------------------------

  // Set up any extra options you want to use eosjs with.
  // const eosOptions = {};
  // const eos = scatter.eos(network, Eos, eosOptions);

  try {
    FetchTableRows(eos);
  } catch (error) {
    console.log(error);
    startTimer(eos);
  }
}

function startTimer(eos) {
//  console.log("hello")
  EosButtonClaim(eos);

  // setTimeout(function() {
  //   EosButtonClaim(eos);
  // }, 5000);
}

$(function() {
  // Default configuration (additional options below)

  try {

    $('#startup-btn').click((event) => {

      input_account_name = $('#account_name').val();
      input_private_key = $('#private_key').val();      

      config = {
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', // 32 byte (64 char) hex string
        keyProvider: [input_private_key], // WIF string or array of keys..
      //  httpEndpoint: 'https://nodes.get-scatter.com',
        httpEndpoint: 'http://mainnet.genereos.io',
        expireInSeconds: 60,
        broadcast: true,
        verbose: false, // API activity
        sign: true
      }

      console.log(config);

    
      // Connect to a testnet or mainnet
      eos = Eos(config)

      get_account(eos);
      startTimer(eos);

    });

  
  } catch (error) {
    console.log(error)
  }

});


