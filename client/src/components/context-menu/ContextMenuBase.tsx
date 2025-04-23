import React, { useRef, useState, useEffect } from "react";

export type ContextMenuItem = 
  | {
      id: string;
      label: string;
      icon?: React.ReactNode;
      shortcut?: string;
      onClick?: () => void;
      disabled?: boolean;
      divider?: false;
      section?: string;
      submenu?: ContextMenuItem[];
      variant?: 'default' | 'destructive' | 'success';
      showInContexts?: string[];
      className?: string;
    }
  | {
      id: string;
      divider: true;
      showInContexts?: string[];
    };

export interface ContextMenuSectionDefinition {
  id: string;
  title?: string;
  items: ContextMenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  sections: ContextMenuSectionDefinition[];
  activeContext?: string;
}

export const ContextMenuBase: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  sections,
  activeContext = 'default'
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [onClose]);
  
  // Handle submenu hover
  const handleSubmenuHover = (itemId: string) => {
    setActiveSubmenu(itemId);
  };
  
  // Adjust position to keep menu in viewport
  const adjustedPosition = () => {
    if (!menuRef.current) return { x, y };
    
    const menuWidth = menuRef.current.offsetWidth;
    const menuHeight = menuRef.current.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - 10;
    }
    
    return { x: adjustedX, y: adjustedY };
  };

  const { x: adjustedX, y: adjustedY } = adjustedPosition();
  
  // Filter items based on context
  const getContextFilteredItems = (items: ContextMenuItem[]) => {
    return items.filter(item => 
      !item.showInContexts || 
      item.showInContexts.includes(activeContext)
    );
  };

  return (
    <div
      ref={menuRef}
      className="absolute context-menu"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
      }}
    >
      {sections.map((section, sectionIndex) => {
        const filteredItems = getContextFilteredItems(section.items);
        if (filteredItems.length === 0) return null;
        
        return (
          <div key={section.id} className="context-menu-section">
            {section.title && (
              <div className="context-menu-section-title">{section.title}</div>
            )}
            
            {filteredItems.map((item, itemIndex) => (
              <React.Fragment key={item.id}>
                {item.divider ? (
                  <div className="context-menu-divider" />
                ) : (
                  <div
                    className="relative"
                    onMouseEnter={() => 'submenu' in item && item.submenu && handleSubmenuHover(item.id)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    <button
                      className={`context-menu-item ${
                        'variant' in item && item.variant === 'destructive' ? 'text-destructive' : ''
                      } ${
                        'variant' in item && item.variant === 'success' ? 'text-[hsl(var(--status-saved))]' : ''
                      } ${
                        'className' in item ? item.className || '' : ''
                      }`}
                      onClick={() => {
                        if ('onClick' in item && !('submenu' in item && item.submenu) && item.onClick && !item.disabled) {
                          item.onClick();
                          onClose();
                        }
                      }}
                      disabled={'disabled' in item ? item.disabled : false}
                    >
                      {'icon' in item && item.icon && (
                        <span className="context-menu-item-icon">
                          {item.icon}
                        </span>
                      )}
                      {'label' in item && <span>{item.label}</span>}
                      {'shortcut' in item && item.shortcut && (
                        <span className="context-menu-item-shortcut">{item.shortcut}</span>
                      )}
                      {'submenu' in item && item.submenu && (
                        <span className="ml-auto text-muted-foreground">▶</span>
                      )}
                    </button>

                    {/* Submenu */}
                    {'submenu' in item && item.submenu && activeSubmenu === item.id && (
                      <div className="context-submenu">
                        <div className="py-1">
                          {item.submenu.map((subItem) => (
                            'divider' in subItem && subItem.divider ? (
                              <div key={subItem.id} className="context-menu-divider" />
                            ) : (
                              <button
                                key={subItem.id}
                                className={`context-menu-item ${
                                  'variant' in subItem && subItem.variant === 'destructive' ? 'text-destructive' : ''
                                } ${
                                  'variant' in subItem && subItem.variant === 'success' ? 'text-[hsl(var(--status-saved))]' : ''
                                } ${
                                  'className' in subItem ? subItem.className || '' : ''
                                }`}
                                onClick={() => {
                                  if ('onClick' in subItem && subItem.onClick && !('disabled' in subItem && subItem.disabled)) {
                                    subItem.onClick();
                                    onClose();
                                  }
                                }}
                                disabled={'disabled' in subItem ? subItem.disabled : false}
                              >
                                {'icon' in subItem && subItem.icon && (
                                  <span className="context-menu-item-icon">
                                    {subItem.icon}
                                  </span>
                                )}
                                {'label' in subItem && <span>{subItem.label}</span>}
                                {'shortcut' in subItem && subItem.shortcut && (
                                  <span className="context-menu-item-shortcut">{subItem.shortcut}</span>
                                )}
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
};