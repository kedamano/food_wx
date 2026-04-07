// 购物车页面逻辑
Page({
  data: {
    // 底部导航栏
    activeTab: 2,
    cartCount: 0,

    // 编辑模式
    isEditMode: false,

    // 商家信息
    storeInfo: {
      name: '川味人家',
      distance: '1.2km',
      deliveryTime: '30分钟'
    },

    // 购物车商品列表
    cartItems: [],

    // 优惠券列表
    coupons: [
      {
        id: 1,
        name: '新人专享券',
        discount: 15,
        condition: '满50可用',
        minAmount: 50
      },
      {
        id: 2,
        name: '会员专享券',
        discount: 10,
        condition: '满30可用',
        minAmount: 30
      },
      {
        id: 3,
        name: '周末特惠券',
        discount: 20,
        condition: '满80可用',
        minAmount: 80
      }
    ],

    // 选中的优惠券
    selectedCoupon: null,

    // 推荐商品
    recommendItems: [
      {
        id: 101,
        name: '香辣鸡翅',
        price: 18.00,
        image: 'https://picsum.photos/200/200?random=1'
      },
      {
        id: 102,
        name: '可乐',
        price: 5.00,
        image: 'https://picsum.photos/200/200?random=2'
      },
      {
        id: 103,
        name: '水果沙拉',
        price: 22.00,
        image: 'https://picsum.photos/200/200?random=3'
      },
      {
        id: 104,
        name: '冰淇淋',
        price: 8.00,
        image: 'https://picsum.photos/200/200?random=4'
      }
    ],

    // 计算属性
    subtotal: 0,        // 商品小计
    deliveryFee: 5.00,  // 配送费
    discount: 0,        // 优惠金额
    totalAmount: 0,     // 实付金额
    selectedCount: 0,   // 选中商品数量
    allSelected: false  // 是否全选
  },

  // 页面加载
  onLoad() {
    console.log('购物车页面加载');
    
    // 初始化费用值，避免显示 null
    this.setData({
      subtotal: '0.00',
      deliveryFee: '5.00',
      discount: '0.00',
      totalAmount: '0.00'
    });

    // 从全局数据获取购物车信息
    this.loadCartData();

    // 计算费用
    this.calculateCosts();
  },

  // 加载购物车数据
  async loadCartData() {
    const app = getApp();
    
    return new Promise((resolve, reject) => {
      app.authRequest({
        url: `/cart/user/${app.globalData.userId || 1}`,
        method: 'GET',
        success: (res) => {
          // app.authRequest 返回的是 {code, message, data} 格式
          if (res && res.code === 200 && res.data) {
            const cartData = res.data;
            
            // 转换购物车数据格式，确保价格和数量是数字类型
            const formattedCartItems = cartData.map(item => ({
              id: item.foodId,
              name: item.name,
              price: Number(item.price) || 0,
              image: item.image || this.getDefaultFoodImage(item.name), // 使用默认图片
              quantity: Number(item.quantity) || 0,
              selected: true, // 默认选中
              cartId: item.cartId,
              itemTotal: Number((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2) // 添加商品小计
            }));

            this.setData({
              cartItems: formattedCartItems
            }, () => {
              // 数据设置完成后重新计算
              this.calculateCosts();
            });

            // 更新全局购物车数量
            app.globalData.cartCount = cartData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
            
            resolve(cartData);
          } else {
            // API 返回错误，使用全局数据
            this.useGlobalCartData();
            resolve([]);
          }
        },
        fail: (err) => {
          console.error('购物车请求失败:', err);
          // 降级使用全局数据
          this.useGlobalCartData();
          resolve([]);
        }
      });
    });
  },

  // 使用全局购物车数据
  useGlobalCartData() {
    const app = getApp();
    const cart = app.globalData.cart || [];
    
    const formattedCartItems = cart.map(item => ({
      id: item.foodId,
      name: item.name,
      price: Number(item.price) || 0,
      image: item.image || this.getDefaultFoodImage(item.name), // 使用默认图片
      quantity: Number(item.quantity) || 0,
      selected: true, // 默认选中
      itemTotal: Number((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2) // 添加商品小计
    }));

    this.setData({
      cartItems: formattedCartItems
    }, () => {
      // 数据设置完成后重新计算
      this.calculateCosts();
    });

    app.globalData.cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  },

  // 返回按钮点击
  onBackClick() {
    console.log('返回按钮点击');
    wx.navigateBack({
      delta: 1
    });
  },

  // 编辑按钮点击
  onEditClick() {
    const isEditMode = this.data.isEditMode;
    this.setData({
      isEditMode: !isEditMode
    });
    console.log('切换编辑模式：', !isEditMode);
  },

  // 商品选择
  onItemSelect(e) {
    const itemId = e.currentTarget.dataset.itemId;
    const selected = e.detail.value;
    const cartItems = this.data.cartItems;

    // 更新选中状态
    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, selected: selected } : item
    );

    this.setData({
      cartItems: updatedItems
    });

    // 重新计算费用
    this.calculateCosts();
  },

  // 全选/取消全选
  onSelectAll(e) {
    const selected = e.detail.value;
    const cartItems = this.data.cartItems;

    // 更新所有商品的选中状态
    const updatedItems = cartItems.map(item => ({
      ...item,
      selected: selected
    }));

    this.setData({
      cartItems: updatedItems,
      allSelected: selected
    });

    // 重新计算费用
    this.calculateCosts();
  },

  // 数量减少
  onQuantityMinus(e) {
    const itemId = e.currentTarget.dataset.itemId;
    const cartItems = this.data.cartItems;

    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity - 1;
        if (newQuantity >= 1) {
          const newItem = { ...item, quantity: newQuantity };
          newItem.itemTotal = (item.price * newQuantity).toFixed(2); // 更新小计
          return newItem;
        }
      }
      return item;
    });

    this.setData({
      cartItems: updatedItems
    });

    // 更新全局购物车
    this.updateGlobalCart(updatedItems);

    // 重新计算费用
    this.calculateCosts();
  },

  // 数量增加
  onQuantityPlus(e) {
    const itemId = e.currentTarget.dataset.itemId;
    const cartItems = this.data.cartItems;

    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + 1;
        const newItem = { ...item, quantity: newQuantity };
        newItem.itemTotal = (item.price * newQuantity).toFixed(2); // 更新小计
        return newItem;
      }
      return item;
    });

    this.setData({
      cartItems: updatedItems
    });

    // 更新全局购物车
    this.updateGlobalCart(updatedItems);

    // 重新计算费用
    this.calculateCosts();
  },

  // 数量输入变化
  onQuantityChange(e) {
    const itemId = e.currentTarget.dataset.itemId;
    const newQuantity = parseInt(e.detail.value);
    const cartItems = this.data.cartItems;

    if (newQuantity < 1) {
      wx.showToast({
        title: '数量不能小于 1',
        icon: 'none'
      });
      return;
    }

    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item, quantity: newQuantity };
        newItem.itemTotal = (item.price * newQuantity).toFixed(2); // 更新小计
        return newItem;
      }
      return item;
    });

    this.setData({
      cartItems: updatedItems
    });

    // 更新全局购物车
    this.updateGlobalCart(updatedItems);

    // 重新计算费用
    this.calculateCosts();
  },

  // 删除商品
  onDeleteItem(e) {
    const itemId = e.currentTarget.dataset.itemId;
    const cartItems = this.data.cartItems;

    wx.showModal({
      title: '确认删除',
      content: '确定要从购物车中删除这个商品吗？',
      success: (res) => {
        if (res.confirm) {
          // 删除商品
          const updatedItems = cartItems.filter(item => item.id !== itemId);

          this.setData({
            cartItems: updatedItems
          });

          // 更新全局购物车
          this.updateGlobalCart(updatedItems);

          // 重新计算费用
          this.calculateCosts();

          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 选择优惠券
  onSelectCoupon() {
    console.log('选择优惠券');
    
    // 显示优惠券选择弹窗
    wx.showModal({
      title: '选择优惠券',
      content: '优惠券功能开发中，敬请期待！',
      showCancel: false,
      confirmText: '知道了'
    });

    // 实际项目中应该显示优惠券列表供用户选择
    // const coupons = this.data.coupons;
    // 用户选择后更新 selectedCoupon
    // this.calculateCosts();
  },

  // 添加推荐商品
  onAddRecommend(e) {
    const item = e.currentTarget.dataset.item;

    // 检查是否已在购物车中
    const existingItem = this.data.cartItems.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      wx.showToast({
        title: '已在购物车中',
        icon: 'none'
      });
      return;
    }

    // 添加到购物车
    const newItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      selected: true
    };

    const updatedItems = [...this.data.cartItems, newItem];

    this.setData({
      cartItems: updatedItems
    });

    // 更新全局购物车
    this.updateGlobalCart(updatedItems);

    // 重新计算费用
    this.calculateCosts();

    wx.showToast({
      title: '已添加到购物车',
      icon: 'success'
    });
  },

  // 结算
  onSettle() {
    const selectedItems = this.data.cartItems.filter(item => item.selected);

    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      });
      return;
    }

    // 检查库存
    const outOfStockItems = selectedItems.filter(item => item.quantity > item.stock);
    if (outOfStockItems.length > 0) {
      wx.showToast({
        title: `${outOfStockItems[0].name} 库存不足`,
        icon: 'none'
      });
      return;
    }

    // 创建订单
    const orderInfo = {
      orderId: Date.now(), // 临时订单ID
      items: selectedItems.map(item => ({
        foodId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        totalPrice: (item.price * item.quantity).toFixed(2)
      })),
      store: this.data.storeInfo,
      totalAmount: this.data.totalAmount,
      deliveryFee: this.data.deliveryFee,
      discount: this.data.discount,
      finalAmount: this.data.totalAmount,
      orderTime: new Date().toISOString()
    };

    // 存储订单信息到全局
    const app = getApp();
    app.globalData.currentOrder = orderInfo;

    // 跳转到订单确认页
    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm',
      success: (res) => {
        console.log('跳转到订单确认页成功');
      },
      fail: (err) => {
        console.error('跳转失败：', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 去选购
  onGoShopping() {
    console.log('去选购');
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 计算费用
  calculateCosts() {
    const cartItems = this.data.cartItems || [];
    const selectedCoupon = this.data.selectedCoupon;

    // 计算商品小计（只计算选中的商品）
    const subtotal = cartItems
      .filter(item => item.selected)
      .reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);

    // 计算配送费（根据商家距离等）
    const deliveryFee = this.calculateDeliveryFee();

    // 计算优惠金额
    let discount = 0;
    if (selectedCoupon && subtotal >= selectedCoupon.minAmount) {
      discount = selectedCoupon.discount;
    }

    // 计算实付金额
    const totalAmount = subtotal + deliveryFee - discount;

    // 计算选中商品数量
    const selectedCount = cartItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    // 检查是否全选
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

    this.setData({
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      discount: discount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      selectedCount,
      allSelected
    });
  },

  // 计算配送费
  calculateDeliveryFee() {
    // 根据距离计算配送费
    const distance = parseFloat(this.data.storeInfo.distance);
    if (distance <= 1) {
      return 3;
    } else if (distance <= 2) {
      return 5;
    } else if (distance <= 3) {
      return 7;
    } else {
      return 10;
    }
  },

  // 更新全局购物车数据
  updateGlobalCart(cartItems) {
    const app = getApp();
    
    // 转换为全局购物车格式
    const globalCart = cartItems.map(item => ({
      foodId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      storeId: this.data.storeInfo.id
    }));

    app.globalData.cart = globalCart;
    app.globalData.cartCount = globalCart.reduce((sum, item) => sum + item.quantity, 0);

    // 更新底部导航栏购物车数量
    const tabBar = this.selectComponent('#tabbar');
    if (tabBar) {
      tabBar.updateCartCount(app.globalData.cartCount);
    }
  },

  // 页面显示
  onShow() {
    console.log('购物车页面显示');

    // 检查购物车数据变更
    const app = getApp();
    const savedCart = wx.getStorageSync('cart') || [];
    const savedCartCount = wx.getStorageSync('cartCount') || 0;

    // 如果本地存储的数据与全局数据不一致，使用本地存储的数据
    if (savedCartCount !== app.globalData.cartCount) {
      app.globalData.cart = savedCart;
      app.globalData.cartCount = savedCartCount;
    }

    // 重新加载购物车数据
    this.loadCartData();

    // 重新计算费用
    this.calculateCosts();
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '美食小程序 - 购物车',
      path: '/pages/cart/cart'
    };
  },

  // 图片加载失败处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    console.error('商品图片加载失败，索引:', index);
    
    const cartItems = this.data.cartItems;
    if (cartItems[index]) {
      cartItems[index].imageError = true;
      this.setData({ cartItems });
    }
  },

  // 推荐商品图片加载失败处理
  onRecommendImageError(e) {
    const index = e.currentTarget.dataset.index;
    console.error('推荐商品图片加载失败，索引:', index);
    
    const recommendItems = this.data.recommendItems;
    if (recommendItems[index]) {
      recommendItems[index].imageError = true;
      this.setData({ recommendItems });
    }
  },

  // 获取默认食品图片
  getDefaultFoodImage(foodName) {
    // 使用在线图片作为默认图片
    const imageMap = {
      '牛肉面': 'https://picsum.photos/200/200?random=5',
      '鸡翅': 'https://picsum.photos/200/200?random=6',
      '可乐': 'https://picsum.photos/200/200?random=7',
      '沙拉': 'https://picsum.photos/200/200?random=8',
      '冰淇淋': 'https://picsum.photos/200/200?random=9',
      '川菜': 'https://picsum.photos/200/200?random=10'
    };
    
    // 查找匹配的图片
    for (const [key, path] of Object.entries(imageMap)) {
      if (foodName && foodName.includes(key)) {
        return path;
      }
    }
    
    // 返回默认图片
    return 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 100);
  },

});