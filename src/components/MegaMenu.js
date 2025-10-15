import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../theme/theme';
import { GiBigDiamondRing, GiNecklace, GiCrystalEarrings, GiGoldBar, GiGems, GiSpikedDragonHead, GiHeartNecklace, GiDiamondRing, GiPearlNecklace } from 'react-icons/gi';
import { FaGem, FaStar } from 'react-icons/fa';
import { LanguageContext } from '../context/LanguageContext';

const MegaMenu = ({ isVisible, setMenuVisible }) => {
    const { t } = useContext(LanguageContext);
    if (!isVisible) return null;

    const menuStructure = [
        {
            title: t('jewelry'),
            columns: [
                {
                    heading: "Shop by Collection",
                    links: [
                        { name: 'Kundan', icon: <GiBigDiamondRing />, to: '/catalog?category=Kundan' },
                        { name: 'American Diamond', icon: <FaGem />, to: '/catalog?category=American%20Diamond' },
                        { name: 'Temple', icon: <GiSpikedDragonHead />, to: '/catalog?category=Temple' },
                        { name: 'Traditional', icon: <GiGems />, to: '/catalog?category=Traditional' },
                        { name: 'Modern', icon: <GiDiamondRing />, to: '/catalog?category=Modern' },
                        { name: 'Kemp', icon: <GiGems />, to: '/catalog?category=Kemp' },
                        { name: 'Pearl', icon: <GiPearlNecklace />, to: '/catalog?category=Pearl' }
                    ]
                },
                {
                    heading: t('shopByType'),
                    links: [
                        { name: 'Necklace', icon: <GiNecklace />, to: '/catalog?type=Necklace' },
                        { name: 'Haram', icon: <GiHeartNecklace />, to: '/catalog?type=Haram' },
                        { name: 'Choker', icon: <GiNecklace />, to: '/catalog?type=Choker' },
                        { name: 'Bangles', icon: <GiGoldBar />, to: '/catalog?type=Bangles' },
                        { name: 'Earrings', icon: <GiCrystalEarrings />, to: '/catalog?type=Earrings' }
                    ]
                }
            ]
        },
        {
            title: t('collections'),
            columns: [
                {
                    heading: t('featured'),
                    links: [
                        { name: t('forRent'), icon: <FaStar />, to: '/catalog?featured=isForRent' },
                        { name: t('forSale'), icon: <FaStar />, to: '/catalog?featured=isForSale' },
                        { name: t('newArrivals'), icon: <FaStar />, to: '/catalog?featured=isNew' },
                        { name: t('bestSellers'), icon: <FaStar />, to: '/catalog?featured=isBestSeller' }
                    ]
                }
            ]
        }
    ];

    const menuStyle = {
        position: 'relative',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        padding: '2rem 4rem',
        display: 'flex',
        gap: '4rem',
        marginTop: '-1px',
        borderTop: `1px solid ${theme.colors.accent}`,
    };
    
    const sectionStyle = {
        flex: 1,
    };
    
    const sectionTitleStyle = {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: '1.5rem',
        borderBottom: `2px solid ${theme.colors.accent}`,
        paddingBottom: '0.5rem',
    };
    
    const columnsContainerStyle = {
        display: 'flex',
        gap: '3rem',
    };

    const columnStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    };

    const columnHeadingStyle = {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: '0.5rem',
    };
    
    const linkStyle = {
        color: '#555',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    const iconStyle = {
        color: theme.colors.secondary,
    };

    return (
        <div style={menuStyle} onMouseLeave={() => setMenuVisible(false)}>
            {menuStructure.map(section => (
                <div key={section.title} style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>{section.title}</h3>
                    <div style={columnsContainerStyle}>
                        {section.columns.map(column => (
                            <div key={column.heading} style={columnStyle}>
                                <h4 style={columnHeadingStyle}>{column.heading}</h4>
                                {column.links.map(link => (
                                    <Link 
                                        key={link.name} 
                                        to={link.to} 
                                        style={linkStyle}
                                        onMouseEnter={e => e.currentTarget.style.color = theme.colors.primary}
                                        onMouseLeave={e => e.currentTarget.style.color = '#555'}
                                        onClick={() => setMenuVisible(false)}
                                    >
                                        <span style={iconStyle}>{link.icon}</span>
                                        <span>{link.name}</span>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MegaMenu; 