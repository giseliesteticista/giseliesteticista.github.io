import React from "react";
import Link from "next/link";

import styles from './styles.module.scss';
import { useRouter } from "next/router";

const Header = () => {

    const router = useRouter();

    return (
        <header className={styles.header}>
            <img src='/images/logo.svg' alt="Giseli Logo" className={styles.logo} onClick={() => router.push('/')} />
        </header>
    )
}

export default Header;