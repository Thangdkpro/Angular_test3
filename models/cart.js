module.exports = function Cart(cart) {
    this.items = cart.items || {};
    this.price = cart.price || 0;
    this.add = function(item, id) {
        var cartItem = this.items[id];
        if (!cartItem) {
            cartItem = this.items[id] = {item: item, quantity: 0,gia:0,thanhtien:0};
        }
        cartItem.quantity++;
        cartItem.gia=cartItem.item.price ;
        cartItem.thanhtien= cartItem.gia * cartItem.quantity;

        this.price += cartItem.item.price;
    };

    this.remove = function(id) {
        delete this.items[id];
    };

    
    this.getItems = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};
