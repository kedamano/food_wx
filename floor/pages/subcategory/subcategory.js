// 子分类页面
Page({
    data: {
        subcategoryName: '',
        foodList: [],
        cartItems: [],
        cartCount: 0,
        cartTotal: 0,
        isLoading: false
    },

    // 页面加载
    onLoad: function(options) {
        console.log('子分类页面加载', options);
        var category = options.category;
        var subcategory = options.subcategory;
        this.setData({
            subcategoryName: subcategory,
            category: category
        });

        // 加载该子分类下的美食
        this.loadFoods(subcategory);
    },

    // 加载美食数据
    loadFoods: function(subcategory) {
        var self = this;
        self.setData({ isLoading: true });

        var app = getApp();
        app.authRequest({
            url: '/food/search',
            method: 'GET',
            data: { name: subcategory },
            success: function(res) {
                if (res && res.code === 200 && res.data) {
                    var foods = [];
                    for (var i = 0; i < res.data.length; i++) {
                        var f = res.data[i];
                        var foodCopy = {};
                        for (var fk in f) foodCopy[fk] = f[fk];
                        foodCopy.image = app.resolveImageUrl ? app.resolveImageUrl(f.image) : f.image;
                        foodCopy.id = f.foodId || f.id;
                        foods.push(foodCopy);
                    }
                    self.setData({ foodList: foods, isLoading: false });
                } else {
                    self.setData({ foodList: [], isLoading: false });
                }
            },
            fail: function() {
                self.setData({ foodList: [], isLoading: false });
            }
        });
    },

    // 添加到购物车
    onAddToCart: function(e) {
        var item = e.currentTarget.dataset.item;
        var cartItems = this.data.cartItems;

        // 用 for 循环查找
        var existingItem = null;
        for (var i = 0; i < cartItems.length; i++) {
            if (cartItems[i].id === item.id) {
                existingItem = cartItems[i];
                break;
            }
        }
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // 手动展开 item 对象属性
            var newItem = {
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1
            };
            cartItems.push(newItem);
        }

        // 用 for 循环计算 cartCount
        var sumCount = 0;
        for (var i = 0; i < cartItems.length; i++) {
            sumCount += cartItems[i].quantity;
        }

        // 用 for 循环计算 cartTotal
        var sumTotal = 0;
        for (var i = 0; i < cartItems.length; i++) {
            sumTotal += cartItems[i].price * cartItems[i].quantity;
        }

        this.setData({
            cartItems: cartItems,
            cartCount: sumCount,
            cartTotal: sumTotal.toFixed(2)
        });

        wx.showToast({ title: '已加入购物车', icon: 'success' });
    },

    // 去结算
    onSettle: function() {
        wx.navigateTo({ url: '/pages/cart/cart' });
    },

    // 点击美食
    onFoodTap: function(e) {
        var foodId = e.currentTarget.dataset.foodId;
        wx.navigateTo({ url: '/pages/food-detail/food-detail?foodId=' + foodId });
    },

    // 返回
    onBackClick: function() {
        wx.navigateBack({ delta: 1 });
    },

    // 分享
    onShareAppMessage: function() {
        return {
            title: this.data.subcategoryName + ' - 美食分类',
            path: '/pages/subcategory/subcategory?category=' + this.data.category + '&subcategory=' + this.data.subcategoryName
        };
    }
});
