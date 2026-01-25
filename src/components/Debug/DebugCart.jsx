import { useCartStore } from '../../store/store';

function DebugCart() {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const currentUser = useCartStore((state) => state.currentUser);

  return (
    <div style={{ position: 'fixed', top: '100px', right: '10px', background: 'white', padding: '10px', border: '1px solid #ccc', zIndex: 9999 }}>
      <h4>Отладка корзины:</h4>
      <p>Текущий пользователь: {currentUser || 'guest'}</p>
      <p>Товаров в корзине: {totalItems}</p>
      <p>Товары: {items.map(item => item.title).join(', ')}</p>
    </div>
  );
}

export default DebugCart;