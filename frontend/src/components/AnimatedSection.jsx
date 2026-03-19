import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const AnimatedSection = ( { children, className = '', delay = 0 } ) =>
{
    const ref = useRef( null );
    const isInView = useInView( ref, { once: true, margin: "-10%" } );

    return (
        <motion.div
            ref={ ref }
            initial={ { opacity: 0, y: 30 } }
            animate={ isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 } }
            transition={ { duration: 0.6, delay: delay, ease: "easeOut" } }
            className={ className }
        >
            { children }
        </motion.div>
    );
};

export default AnimatedSection;
