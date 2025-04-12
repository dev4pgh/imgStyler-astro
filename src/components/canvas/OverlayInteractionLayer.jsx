import React from 'react';
import { useOverlayDrawing } from '../../hooks/useOverlayDrawing';
import { useOverlayEditing } from '../../hooks/useOverlayEditing';
import { useEditingContext } from '../../context/EditingContext';

function getDrawBounds(overlay, currentCrop, scaleX, scaleY) {
    if (!overlay || !currentCrop || scaleX <= 0 || scaleY <= 0) return null;
    const relX = overlay.x - currentCrop.x;
    const relY = overlay.y - currentCrop.y;
    const drawX = Math.round(relX * scaleX);
    const drawY = Math.round(relY * scaleY);
    const drawW = Math.round(overlay.width * scaleX);
    const drawH = Math.round(overlay.height * scaleY);
    return { x: drawX, y: drawY, width: drawW, height: drawH };
}

const HANDLE_SIZE_DISPLAY = 8;

const OverlayInteractionLayer = ({ containerRef }) => {
    const context = useEditingContext();

    if (!context) {
        return null;
    }

    const {
        overlayInteractionState, setOverlayInteractionState,
        selectedOverlayId, setSelectedOverlayId,
        overlays, setOverlays, crop, displayScale, isCropping,
        lastInteractionEndTime, setLastInteractionEndTime,
    } = context;

    const { interactionLayerProps: drawingLayerProps, drawingRect } = useOverlayDrawing({
        setOverlayInteractionState,
        setOverlays,
        containerRef,
        setLastInteractionEndTime,
    });

    const {
        isEditing,
        isResizing,
        editingOverlayData,
        overlayBoundingBoxProps,
        handles,
    } = useOverlayEditing({
        containerRef,
        setOverlays,
        setLastInteractionEndTime,
    });

    const handleLayerClick = (e) => {
        const timeSinceLastInteraction = Date.now() - lastInteractionEndTime;
        const CLICK_THRESHOLD_MS = 100;

        if (timeSinceLastInteraction < CLICK_THRESHOLD_MS) {
            e.stopPropagation();
            return;
        }

        const wasOverlaySelected = selectedOverlayId !== null;
        if (!overlayInteractionState.active) {
            setSelectedOverlayId(null);
            console.log("Interaction layer background clicked");
            if (wasOverlaySelected) {
                e.stopPropagation();
            }
        }
    };

    const handleOverlayClick = (e, overlayId) => {
        e.stopPropagation();
        setSelectedOverlayId(overlayId);
        console.log("Overlay clicked:", overlayId);
    };

    const isDrawing = overlayInteractionState.active;
    const allowSelectionOrEditing = !isCropping && !isDrawing && !isEditing;
    const interactionActive = isDrawing || isEditing;
    const scaleX = displayScale;
    const scaleY = displayScale;

    return (
        <div
            {...(isDrawing ? drawingLayerProps : { onClick: handleLayerClick })}
            style={{
                ...(isDrawing ? drawingLayerProps.style : {}),
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                cursor: isDrawing ? 'crosshair' : (isEditing ? (isResizing ? 'crosshair' : 'grabbing') : (allowSelectionOrEditing ? 'default' : 'not-allowed')),
                zIndex: 49,
                touchAction: 'none',
            }}
        >
            {isDrawing && drawingRect && (
                <div style={{
                    position: 'absolute', border: '1px dashed rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)', backgroundColor: 'rgba(0, 120, 255, 0.1)',
                    left: `${drawingRect.x}px`, top: `${drawingRect.y}px`,
                    width: `${drawingRect.width}px`, height: `${drawingRect.height}px`,
                    pointerEvents: 'none', zIndex: 51,
                }}></div>
            )}
            {isDrawing && (
                <div style={{ position: 'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 6px', fontSize: '10px', borderRadius: '3px', zIndex: 52, pointerEvents: 'none', }}> Draw {overlayInteractionState.type} region (Esc to cancel) </div>
            )}

            {!isDrawing && overlays.map(overlay => {
                const sourceData = (isEditing && overlay.id === selectedOverlayId && editingOverlayData)
                    ? editingOverlayData
                    : overlay;

                const bounds = getDrawBounds(sourceData, crop, scaleX, scaleY);
                if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;

                const isSelected = overlay.id === selectedOverlayId;

                const combinedProps = isSelected
                    ? { ...overlayBoundingBoxProps, onClick: (e) => handleOverlayClick(e, overlay.id) }
                    : { onClick: (e) => handleOverlayClick(e, overlay.id) };


                return (
                    <div
                        key={overlay.id}
                        {...combinedProps}
                        style={{
                            ...(combinedProps.style || {}),
                            position: 'absolute',
                            left: `${bounds.x}px`,
                            top: `${bounds.y}px`,
                            width: `${bounds.width}px`,
                            height: `${bounds.height}px`,
                            zIndex: isSelected ? 51 : 50,
                            border: isSelected
                                ? `2px solid rgba(59, 130, 246, ${isEditing ? 1 : 0.7})`
                                : 'none',
                            // Could add: Dashed border for hit testing non-selected overlays
                            // border: isSelected ? '...' : '1px dashed transparent',
                            // background: isSelected && isEditing ? 'rgba(59, 130, 246, 0.1)' : 'transparent', // Optional bg hint
                        }}
                    >
                        {isSelected && handles.map(handle => (
                            <div
                                key={handle.id}
                                {...handle.props}
                                style={{
                                    position: 'absolute',
                                    left: `${handle.x}px`,
                                    top: `${handle.y}px`,
                                    width: `${HANDLE_SIZE_DISPLAY}px`,
                                    height: `${HANDLE_SIZE_DISPLAY}px`,
                                    border: '1px solid rgba(255,255,255,0.9)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.9)',
                                    borderRadius: '1px',
                                    cursor: handle.cursor,
                                    zIndex: 52,
                                    transform: 'translateZ(0)',
                                }}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default OverlayInteractionLayer;