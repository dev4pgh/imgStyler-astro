import React from 'react';
import { useOverlayDrawing } from '../../hooks/useOverlayDrawing';
import { useEditingContext } from '../../context/EditingContext';

const OverlayInteractionLayer = ({ containerRef }) => {
    const context = useEditingContext();

    if (!context) {
        return null;
    }

    const {
        overlayInteractionState,
        setOverlayInteractionState,
        setOverlays
    } = context;

    const { interactionLayerProps, drawingRect } = useOverlayDrawing({
        overlayInteractionState,
        setOverlayInteractionState,
        setOverlays,
        containerRef,
    });

    const handleLayerClick = (e) => {
        e.stopPropagation();
    }

    const drawingRectStyle = drawingRect
        ? {
            position: 'absolute',
            left: `${drawingRect.x}px`,
            top: `${drawingRect.y}px`,
            width: `${drawingRect.width}px`,
            height: `${drawingRect.height}px`,
            border: '1px dashed rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
            backgroundColor: 'rgba(0, 120, 255, 0.1)',
            pointerEvents: 'none',
            zIndex: 51,
        }
        : { display: 'none' };

    const finalInteractionLayerProps = { ...interactionLayerProps, onClick: handleLayerClick };

    return (
        <div {...finalInteractionLayerProps}>
            <div style={drawingRectStyle}></div>
            {overlayInteractionState.active && (
                <div style={{
                    position: 'absolute',
                    top: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 6px',
                    fontSize: '10px',
                    borderRadius: '3px',
                    zIndex: 52,
                    pointerEvents: 'none',
                }}>
                    Draw {overlayInteractionState.type} region (Esc to cancel)
                </div>
            )}
        </div>
    );
};

export default OverlayInteractionLayer;