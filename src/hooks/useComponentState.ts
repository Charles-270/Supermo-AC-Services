import { useState, useCallback } from 'react';
import type { ComponentState, InteractionState, ComponentVariant, ComponentSize } from '../types/design-system';

// Hook for managing component state
export function useComponentState(
    initialVariant: ComponentVariant = 'primary',
    initialSize: ComponentSize = 'md'
) {
    const [state, setState] = useState<ComponentState>({
        isLoading: false,
        isDisabled: false,
        variant: initialVariant,
        size: initialSize,
    });

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const setDisabled = useCallback((disabled: boolean) => {
        setState(prev => ({ ...prev, isDisabled: disabled }));
    }, []);

    const setVariant = useCallback((variant: ComponentVariant) => {
        setState(prev => ({ ...prev, variant }));
    }, []);

    const setSize = useCallback((size: ComponentSize) => {
        setState(prev => ({ ...prev, size }));
    }, []);

    const setError = useCallback((error?: string) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            isDisabled: false,
            variant: initialVariant,
            size: initialSize,
        });
    }, [initialVariant, initialSize]);

    return {
        state,
        setLoading,
        setDisabled,
        setVariant,
        setSize,
        setError,
        reset,
    };
}

// Hook for managing interaction state
export function useInteractionState() {
    const [state, setState] = useState<InteractionState>({
        isHovered: false,
        isFocused: false,
        isPressed: false,
        isSelected: false,
    });

    const setHovered = useCallback((hovered: boolean) => {
        setState(prev => ({ ...prev, isHovered: hovered }));
    }, []);

    const setFocused = useCallback((focused: boolean) => {
        setState(prev => ({ ...prev, isFocused: focused }));
    }, []);

    const setPressed = useCallback((pressed: boolean) => {
        setState(prev => ({ ...prev, isPressed: pressed }));
    }, []);

    const setSelected = useCallback((selected: boolean) => {
        setState(prev => ({ ...prev, isSelected: selected }));
    }, []);

    const reset = useCallback(() => {
        setState({
            isHovered: false,
            isFocused: false,
            isPressed: false,
            isSelected: false,
        });
    }, []);

    return {
        state,
        setHovered,
        setFocused,
        setPressed,
        setSelected,
        reset,
    };
}

// Hook for managing form field state
export function useFormFieldState(initialValue: any = '') {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState<string | undefined>();
    const [touched, setTouched] = useState(false);
    const [dirty, setDirty] = useState(false);

    const handleChange = useCallback((newValue: any) => {
        setValue(newValue);
        setDirty(newValue !== initialValue);
        if (error && touched) {
            setError(undefined);
        }
    }, [initialValue, error, touched]);

    const handleBlur = useCallback(() => {
        setTouched(true);
    }, []);

    const validate = useCallback((validationFn?: (value: any) => string | undefined) => {
        if (validationFn) {
            const validationError = validationFn(value);
            setError(validationError);
            return !validationError;
        }
        return true;
    }, [value]);

    const reset = useCallback(() => {
        setValue(initialValue);
        setError(undefined);
        setTouched(false);
        setDirty(false);
    }, [initialValue]);

    return {
        value,
        error,
        touched,
        dirty,
        isValid: !error,
        handleChange,
        handleBlur,
        validate,
        reset,
        setError,
    };
}