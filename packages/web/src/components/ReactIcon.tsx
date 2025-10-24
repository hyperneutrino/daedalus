export function ReactIcon({ icon, brand, className = "" }: { icon: string; brand?: boolean; className?: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1rem", height: "1rem", fontSize: "90%" }}>
            <i className={`fa-${brand ? "brands" : "solid"} fa-${icon} ${className}`} />
        </span>
    );
}
