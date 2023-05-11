async function getPorducts() {
  try {
    const data = await fetch(
      "https://ecommercebackend.fundamentos-29.repl.co/"
    );
    const res = await data.json();
    window.localStorage.setItem("products", JSON.stringify(res));
    return res;
  } catch (error) {
    console.error(error);
  }
}

function printProducts(db) {
  const productsHTML = document.querySelector(".products");
  let html = "";
  for (const product of db.products) {
    const buttonAdd = product.quantity ? ` <i class='bx bx-plus' id="${product.id}"></i>` : "<span class='soldOut'>Agotado</span>"
    const {
      image,
      name,
      price,
      quantity,
      category,
    } = product;
    html += `
            <div class="product">
              <div class="product__img">
                <img src="${image}" alt="imagen_product" />
             </div>  
             <div class="divisor"></div>
               <div class="product__info">
               
                  <h4 class="open">${name} | <span><b>Stock</b>: ${quantity}</span> </h4>
                     <h5>$${price + ".00"} 
                     ${buttonAdd}
                     </h5>
                     <h6> ${category}</h6>

                </div>
              
            </div>
           `;

  }

  productsHTML.innerHTML = html;
}

function handleShowCart() {
  const iconCardAddHTML = document.querySelector(".bxs-cart-add");
  const cartHTML = document.querySelector(".cart");

  iconCardAddHTML.addEventListener("click", function () {
    cartHTML.classList.toggle("cart__show");
  });

}

function addToCartFromProducts(db) {
  const productsHTML = document.querySelector(".products");

  productsHTML.addEventListener("click", function (e) {
    if (e.target.classList.contains("bx-plus")) {
      const id = Number(e.target.id);

      let productFind = null;

      for (const product of db.products) {
        if (product.id === id) {
          productFind = product;
          break;
        }
      }
      /*en esta parte vaciamos el stock de nuestro carrito*/
      if (db.carts[productFind.id]) {
        if (productFind.quantity === db.carts[productFind.id].amount)
          return Swal.fire("Disculpe, se agotó este producto 😒");

        db.carts[productFind.id].amount++;
      } else {
        db.carts[productFind.id] = {
          ...productFind,
          amount: 1,
        };
      }
      //creamos una persistencia de datos;
      window.localStorage.setItem("cart", JSON.stringify(db.carts));
      printPorductsInCard(db)
      printTotal(db);
      handlePrintAmountProducts(db)

    }
  });
}

function printPorductsInCard(db) {
  // vamos a pintar el carrito;

  const cartProducts = document.querySelector(".cart__products");

  let htmlCart = "";
  for (const productKey in db.carts) {
    const {
      quantity,
      price,
      name,
      image,
      id,
      amount,
    
    } = db.carts[productKey];
    /*.......................................destructuracion para tomar las propiedades*/

    htmlCart += `
      <div class="cart__product">
         <div class="cart__product--img">
            <img src="${image}" alt="image-product">
         </div>

       <div class="cart__product--body">
            <h4>${name}</h4>
       <div class="price">
            <span>$${price + ".00"}</span>
            <p> Stock: ${quantity}.</p>
          </div>

          <div class="cart__product--body-op" id="${id}">
            <i class='bx bx-plus-circle' ></i>
            <span>${amount}. und</span>
            <i class='bx bx-minus-circle' ></i>
             <i class='bx bxs-trash'></i>
       </div>

      </div>

       

 </div>
      `;

  }

  cartProducts.innerHTML = htmlCart;

};

function handleProductsInCart(db) {


  const cartProducts = document.querySelector(".cart__products")
  cartProducts.addEventListener("click", function (e) {

    if (e.target.classList.contains("bx-plus-circle")) {
      const id = Number(e.target.parentElement.id);

      for (const product of db.products) {
        if (product.id === id) {
          productFind = product;
          break;
        }
      };
      if (productFind.quantity === db.carts[productFind.id].amount)
        return Swal.fire(`Solo tenemos esta cantidad en almacen😒`);

      db.carts[id].amount++;
    }

    if (e.target.classList.contains("bx-minus-circle")) {
      const id = Number(e.target.parentElement.id);

      if (db.carts[id].amount === 1) {
        const response = confirm(
          "Desea eliminar este producto de su carrito."
        );
        if (!response) return;
        delete db.carts[id];
      } else {
        db.carts[id].amount--;
      }


    }

    if (e.target.classList.contains("bxs-trash")) {
      const id = Number(e.target.parentElement.id);

      const response = confirm(
        "¿Quieres eliminar este producto?"
      );
      if (!response) return db.carts[id];

      delete db.carts[id];

    }

    window.localStorage.setItem("cart", JSON.stringify(db.carts))
    printPorductsInCard(db);
    printTotal(db);
    handlePrintAmountProducts(db);

  })
}

function printTotal(db) {
  const infoAmount = document.querySelector(".info__amount");
  const infoTotal = document.querySelector(".info__total");

  let totalPrice = 0;
  let amountProducts = 0;

  for (product in db.carts) {
    const {
      amount,
      price
    } = db.carts[product];

    totalPrice += price * amount;
    amountProducts += amount
  };
  infoAmount.textContent = "Unidades:" + amountProducts
  infoTotal.textContent = "Total $" + totalPrice + ".00"


};

function handleTotal(db) {
  const btnBuy = document.querySelector(".btn__buy"); // buscamos la clase.
  btnBuy.addEventListener("click", function () /*agregamos un evento de click*/ {
    if (!Object.values(db.carts).length)
      return alert("Debes ingresar un articulo al carrito");
    // validamos si hay articulos en el carrito de compras

    // preguntamos si esta seguro de comprar
    const response = confirm("¿Seguro que quieres comprar el producto seleccionado?");
    if (!response) return;
    // en esta seccion nos quedamos con los articulos a comprar y bajamos el stock.
    //hay que comparar productos con los que estan en la caja y en caso de que coincidan restarle el stock
    const currentProducts = [];

    for (const product of db.products) {
      // encadenamiento opcional ?
      const productCart = db.carts[product.id]
      if (product.id === productCart?.id) {
        currentProducts.push({
          ...product,
          quantity: product.quantity - productCart.amount
        })
      } else {
        currentProducts.push(product)
      }

    }
    db.products = currentProducts;
    db.carts = {};

    window.localStorage.setItem("products", JSON.stringify(db.products));
    window.localStorage.setItem("carts", JSON.stringify(db.carts));
    printTotal(db);
    printPorductsInCard(db);
    printProducts(db);
    handlePrintAmountProducts(db)

  });
}

function handlePrintAmountProducts(db) {
  const amountProducts = document.querySelector(".amount__products")
  let amount = 0;

  for (const product in db.carts) {

    amount += db.carts[product].amount


  }
  amountProducts.textContent = amount

}

function showLoadingHtml() {
  window.addEventListener("load", function () {
    setTimeout(function () {
      const contentLoadingHtml = document.querySelector(".load");
      contentLoadingHtml.classList.add("load__none")

    }, 3000)
  })
}

function addInfoToButtonAllFiltter(db) {
  const objProduct = {};

  objProduct.all = db.products.length;


  for (const product of db.products) {
    objProduct[product.category] = objProduct[product.category] + 1 || 1;

  }
  let html = "";

  let arrays = Object.entries(objProduct)

  for (const info of arrays) {
    html += `<button class="btn" data-filter="${info[0]}">  ${info[0]} <br>${info[1]} </button>`
  }

  document.querySelector(".container__filter").innerHTML = html;


  
}

function printFilterButton(db) {
  const containerFilterHTML = document.querySelector(".container__filter");

  containerFilterHTML.addEventListener("click", function (e) {
   
    if (e.target.classList.contains("btn")) {
      const typeFilter = e.target.dataset.filter;
    let newArray = [];

    if (typeFilter === "all") {
      return  printProducts(db);
    }

    for (const product of db.products) {
      if (product.category === typeFilter) {
        newArray.push(product)

      }
  
    }
    printProducts(newArray);
  
   
    console.log(newArray);
  }

  })
      
    

}
function printModalPopUp(db){
  let html = "";

  for (const product in db.products) {
    const {
      image,
      name,
      description,
      price,
      quantity,
      id,
    } = db.products[product];
   

    html += `
          <div class="popup__img">
            <img src="${image}" alt="imagen-product">
          </div>

          <div class="popup__info">
            <h4>${name}</h4>
            <p>${description}</p>
          </div>

          <div class="popup__info__price">
             <div class="popup__price">
                 <span>$${price + ".00"}</span>
                 <a href="#" id="btn-close-popup" class="btn-close-popup" >
                 <i class='bx bx-x' ></i>
               </a>
               </div>
            <p> Stock: ${quantity}.</p>
          </div>
    `


  }
  printProducts(db)
}

async function main() {
  const db = {
    products: JSON.parse(window.localStorage.getItem("products")) ||
      (await getPorducts()),
    carts: JSON.parse(window.localStorage.getItem("cart")) || {},
  };



  printProducts(db);
  handleShowCart();
  addToCartFromProducts(db);
  printPorductsInCard(db);
  handleProductsInCart(db);
  printTotal(db);
  handleTotal(db);
  handlePrintAmountProducts(db);
  showLoadingHtml();
  addInfoToButtonAllFiltter(db);
  printFilterButton(db);
  printModalPopUp(db)
  


 
 
  


  
}

main();