NEW_FILE_CODE
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
    onLoad(options) {
        console.log('子分类页面加载', options);
        const { category, subcategory } = options;
        this.setData({
            subcategoryName: subcategory,
            category: category
        });

        // 加载该子分类下的美食
        this.loadFoods(subcategory);
    },

    // 加载美食数据
    loadFoods(subcategory) {
        this.setData({ isLoading: true });

        // 模拟从服务器获取数据
        setTimeout(() => {
            const foods = this.getFoodsBySubcategory(subcategory);
            this.setData({
                foodList: foods,
                isLoading: false
            });
        }, 500);
    },

    // 根据子分类获取美食
    getFoodsBySubcategory(subcategory) {
        const foodMap = {
            // 面食类
            '牛肉面': [
                {
                    id: 101,
                    name: '经典牛肉面',
                    description: '精选优质牛肉，口感鲜美',
                    price: 28.00,
                    rating: 4.8,
                    sales: 156,
                    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop'
                },
                {
                    id: 102,
                    name: '红烧牛肉面',
                    description: '传统工艺，味道醇厚',
                    price: 30.00,
                    rating: 4.7,
                    sales: 189,
                    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop'
                }
            ],
            '炸酱面': [
                {
                    id: 201,
                    name: '老北京炸酱面',
                    description: '正宗老北京风味',
                    price: 22.00,
                    rating: 4.6,
                    sales: 145,
                    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300&h=200&fit=crop'
                }
            ],
            '刀削面': [
                {
                    id: 301,
                    name: '山西刀削面',
                    description: '正宗山西风味',
                    price: 20.00,
                    rating: 4.5,
                    sales: 132,
                    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop'
                }
            ],
            '拉面': [
                {
                    id: 401,
                    name: '兰州拉面',
                    description: '正宗兰州风味',
                    price: 18.00,
                    rating: 4.7,
                    sales: 267,
                    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=300&h=200&fit=crop'
                }
            ],

            // 披萨类
            '意式披萨': [
                {
                    id: 501,
                    name: '玛格丽特披萨',
                    description: '经典意式风味',
                    price: 58.00,
                    rating: 4.8,
                    sales: 98,
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop'
                }
            ],
            '美式披萨': [
                {
                    id: 601,
                    name: '美式牛肉披萨',
                    description: '美式经典口味',
                    price: 68.00,
                    rating: 4.6,
                    sales: 112,
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop'
                }
            ],

            // 汉堡类
            '牛肉汉堡': [
                {
                    id: 701,
                    name: '经典牛肉汉堡',
                    description: '100% 纯牛肉',
                    price: 32.00,
                    rating: 4.7,
                    sales: 234,
                    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop'
                }
            ],
            '鸡肉汉堡': [
                {
                    id: 801,
                    name: '香辣鸡腿堡',
                    description: '外酥里嫩',
                    price: 28.00,
                    rating: 4.6,
                    sales: 289,
                    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&h=200&fit=crop'
                }
            ],

            // 甜品类
            '冰淇淋': [
                {
                    id: 901,
                    name: '香草冰淇淋',
                    description: '进口奶源制作',
                    price: 15.00,
                    rating: 4.7,
                    sales: 456,
                    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop'
                }
            ],
            '蛋糕': [
                {
                    id: 1001,
                    name: '巧克力蛋糕',
                    description: '浓郁巧克力风味',
                    price: 35.00,
                    rating: 4.8,
                    sales: 178,
                    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop'
                }
            ],
            '圣代': [
                {
                    id: 1101,
                    name: '草莓圣代',
                    description: '新鲜草莓制作',
                    price: 22.00,
                    rating: 4.7,
                    sales: 312,
                    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop'
                }
            ],
            '奶昔': [
                {
                    id: 1201,
                    name: '芒果奶昔',
                    description: '新鲜芒果制作',
                    price: 18.00,
                    rating: 4.6,
                    sales: 267,
                    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop'
                }
            ],

            // 饮料类
            '果汁': [
                {
                    id: 1301,
                    name: '鲜榨橙汁',
                    description: '100% 鲜榨',
                    price: 18.00,
                    rating: 4.7,
                    sales: 345,
                    image: 'https://images.unsplash.com/photo-1622483767020-38c985e645ac?w=300&h=200&fit=crop'
                }
            ],
            '奶茶': [
                {
                    id: 1401,
                    name: '珍珠奶茶',
                    description: '台湾风味',
                    price: 15.00,
                    rating: 4.6,
                    sales: 567,
                    image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf42e6?w=300&h=200&fit=crop'
                }
            ],
            '咖啡': [
                {
                    id: 1501,
                    name: '美式咖啡',
                    description: '现磨咖啡豆',
                    price: 20.00,
                    rating: 4.5,
                    sales: 234,
                    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop'
                }
            ],

            // 沙拉类
            '水果沙拉': [
                {
                    id: 1601,
                    name: '缤纷水果沙拉',
                    description: '多种新鲜水果',
                    price: 25.00,
                    rating: 4.6,
                    sales: 189,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop'
                }
            ],
            '蔬菜沙拉': [
                {
                    id: 1701,
                    name: '健康蔬菜沙拉',
                    description: '有机蔬菜',
                    price: 20.00,
                    rating: 4.5,
                    sales: 156,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop'
                }
            ],
            '鸡肉沙拉': [
                {
                    id: 1801,
                    name: '鸡胸肉沙拉',
                    description: '高蛋白低脂肪',
                    price: 32.00,
                    rating: 4.7,
                    sales: 178,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop'
                }
            ],
            '海鲜沙拉': [
                {
                    id: 1901,
                    name: '鲜虾沙拉',
                    description: '新鲜海鲜',
                    price: 38.00,
                    rating: 4.8,
                    sales: 134,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop'
                }
            ]
        };

        return foodMap[subcategory] || [];
    },

    // 添加到购物车
    onAddToCart(e) {
        const item = e.currentTarget.dataset.item;
        const cartItems = this.data.cartItems;

        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({ ...item, quantity: 1 });
        }

        this.setData({
            cartItems,
            cartCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
            cartTotal: cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
        });

        wx.showToast({ title: '已加入购物车', icon: 'success' });
    },

    // 去结算
    onSettle() {
        wx.navigateTo({ url: '/pages/cart/cart' });
    },

    // 点击美食
    onFoodTap(e) {
        const foodId = e.currentTarget.dataset.foodId;
        wx.navigateTo({ url: `/pages/food-detail/food-detail?foodId=${foodId}` });
    },

    // 返回
    onBackClick() {
        wx.navigateBack({ delta: 1 });
    },

    // 分享
    onShareAppMessage() {
        return {
            title: `${this.data.subcategoryName} - 美食分类`,
            path: `/pages/subcategory/subcategory?category=${this.data.category}&subcategory=${this.data.subcategoryName}`
        };
    }
});
