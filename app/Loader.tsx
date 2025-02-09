import styles from "./Loader.module.css";

function Loader() {
  return (
    <div className="absolute inset-0 bg-slate-200/20 backdrop-blur-sm flex items-center justify-center">
      <div className={styles.external_container}>
        <div className={styles.background_container}>
          <div className={styles.e1}> </div>
          <div className={styles.e2}> </div>
          <div className={styles.e3}> </div>
          <div className={styles.e4}> </div>
        </div>
        <div className={styles.loader_container}>
          <div className={styles.loader}> </div>
        </div>
      </div>
    </div>
  );
}

export default Loader;
