import { ref, computed } from "vue";
import { defineStore } from "pinia";

interface CartItem {
  id: number;
  name: string;
  price: string;
  img: string;
  selectedColor: string;
  selectedSize?: number;
  qty: number;
}

export const useCartStore = defineStore("cart", () => {
  const cartItems = ref<CartItem[]>([]);
  
  // 최근 본 상품 ID 리스트 (최대 5개 영속성 저장)
  const recentlyViewed = ref<number[]>([]);

  // 장바구니 추가
  const addToCart = (product: {
    id: number;
    name: string;
    price: string;
    img: string;
    selectedColor: string;
    selectedSize?: number | null;
  }) => {
    const color = product.selectedColor;
    const size = product.selectedSize || null;

    const existing = cartItems.value.find(
      (item) => item.id === product.id && 
                item.selectedColor === color && 
                (!size || item.selectedSize === size)
    );

    if (existing) {
      existing.qty++;
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        selectedColor: color,
        selectedSize: size || undefined,
        qty: 1
      });
    }
  };

  // 최근 본 상품 추가 액션
  const addRecentlyViewed = (productId: number) => {
    // 기존에 존재하면 해당 항목 삭제 (가장 첫 항목으로 옮기기 위해)
    recentlyViewed.value = recentlyViewed.value.filter(id => id !== productId);
    // 배열 가장 앞에 삽입
    recentlyViewed.value.unshift(productId);
    // 최대 5개로 제한
    if (recentlyViewed.value.length > 5) {
      recentlyViewed.value.pop();
    }
  };

  // 수량 조절
  const increaseQty = (item: CartItem) => {
    item.qty++;
  };

  const decreaseQty = (item: CartItem) => {
    if (item.qty > 1) {
      item.qty--;
    } else {
      removeCartItem(item);
    }
  };

  // 아이템 삭제
  const removeCartItem = (item: CartItem) => {
    cartItems.value = cartItems.value.filter(
      (i) => !(i.id === item.id && 
               i.selectedColor === item.selectedColor && 
               i.selectedSize === item.selectedSize)
    );
  };

  // 계산 computed
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      const priceNum = parseInt(item.price.replace(/[^0-9]/g, ""), 10);
      return sum + (priceNum * item.qty);
    }, 0);
  });

  const totalCartCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.qty, 0);
  });

  return {
    cartItems,
    recentlyViewed,
    addToCart,
    addRecentlyViewed,
    increaseQty,
    decreaseQty,
    removeCartItem,
    totalPrice,
    totalCartCount
  };
}, {
  persist: {
    storage: persistedState.localStorage
  }
});
