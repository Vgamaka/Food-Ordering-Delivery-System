import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartGroups, setCartGroups] = useState(() => {
    const stored = localStorage.getItem("cartGroups");
    return stored ? JSON.parse(stored) : [];
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("cartGroups", JSON.stringify(cartGroups));
  }, [cartGroups]);

  const addToCart = (item) => {
    const { restaurantId, restaurantName } = item;

    const groupIndex = cartGroups.findIndex((g) => g.restaurantId === restaurantId);
    if (groupIndex !== -1) {
      // Restaurant already exists
      const group = cartGroups[groupIndex];
      const existingItem = group.items.find((i) => i._id === item._id);

      if (existingItem) {
        group.items = group.items.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        group.items.push({ ...item, quantity: item.quantity || 1 });
      }

      const updated = [...cartGroups];
      updated[groupIndex] = group;
      setCartGroups(updated);
    } else {
      // New restaurant group
      setCartGroups([
        ...cartGroups,
        {
          restaurantId,
          restaurantName,
          items: [{ ...item, quantity: item.quantity || 1 }],
        },
      ]);
    }

    return { status: "success" };
  };

  const incrementItem = (restaurantId, itemId) => {
    setCartGroups((prev) =>
      prev.map((group) =>
        group.restaurantId === restaurantId
          ? {
              ...group,
              items: group.items.map((item) =>
                item._id === itemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          : group
      )
    );
  };

  const decrementItem = (restaurantId, itemId) => {
    setCartGroups((prev) =>
      prev.map((group) =>
        group.restaurantId === restaurantId
          ? {
              ...group,
              items: group.items.map((item) =>
                item._id === itemId
                  ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                  : item
              ),
            }
          : group
      )
    );
  };

  const removeFromCart = (restaurantId, itemId) => {
    const updated = cartGroups
      .map((group) =>
        group.restaurantId === restaurantId
          ? {
              ...group,
              items: group.items.filter((item) => item._id !== itemId),
            }
          : group
      )
      .filter((group) => group.items.length > 0);
    setCartGroups(updated);
  };

  const clearCart = () => setCartGroups([]);

  const getTotal = (group) =>
    group.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartGroups,
        addToCart,
        incrementItem,
        decrementItem,
        removeFromCart,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
